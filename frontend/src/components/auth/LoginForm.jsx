import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import PasswordToggle from './PasswordToggle';

export default function LoginForm({ onSwitchToRegister }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      if (err.needsVerification || err.response?.status === 403) {
        const email = err.email || err.response?.data?.email || form.email;
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <GoogleSignInButton />
      <div className="auth-divider" role="separator">
        <span>or</span>
      </div>
      <form onSubmit={onSubmit} className="form" noValidate>
        <label>
          <span className="field-label">Email address</span>
          <input
            type="email"
            autoFocus
            autoComplete="email"
            placeholder="you@marsu.edu.ph"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          <span className="field-label">Password</span>
          <span className="pw-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </span>
        </label>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="muted">
        No account?{' '}
        {onSwitchToRegister ? (
          <button type="button" className="link-btn" onClick={onSwitchToRegister}>
            Register
          </button>
        ) : (
          <Link to="/register">Register</Link>
        )}
      </p>
    </>
  );
}
