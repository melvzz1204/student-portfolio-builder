import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import {
  clearMockSession,
  loginAccount,
  readMockUser,
  registerAccount,
  resendOtpAccount,
  verifyOtpAccount,
} from '../api/auth';

const AuthContext = createContext(null);
const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      if (useMock) {
        setUser(readMockUser());
      } else {
        const { data } = await api.get('/auth/me');
        setUser(data?.data?.user || null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const result = await loginAccount(email, password);
    setUser(result.user);
    return result.user;
  };

  // Bago: tumatanggap ng student fields; nagbabalik ng { needsVerification, email }
  // imbes na diretso login — dadaan muna sa Verify OTP page.
  const register = async (fields) => {
    const result = await registerAccount(fields);
    if (result?.user) setUser(result.user);
    return result;
  };

  const verifyOtp = async (email, otp) => {
    const result = await verifyOtpAccount(email, otp);
    if (result?.user) setUser(result.user);
    return result;
  };

  const resendOtp = async (email) => resendOtpAccount(email);

  // Completes the backend Google OAuth redirect: stores the access token
  // from /auth/callback?token=... and hydrates the user.
  const completeGoogleLogin = async (token) => {
    localStorage.setItem('accessToken', token);
    try {
      const { data } = await api.get('/auth/me');
      const nextUser = data?.data?.user || null;
      if (!nextUser) throw new Error('No user returned');
      setUser(nextUser);
      return nextUser;
    } catch (err) {
      localStorage.removeItem('accessToken');
      setUser(null);
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (!useMock) await api.post('/auth/logout');
    } catch {
      // ignore
    }
    if (useMock) clearMockSession();
    else localStorage.removeItem('accessToken');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, verifyOtp, resendOtp, completeGoogleLogin, logout, isAuthenticated: !!user }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
