import api from './client';
import { OTP_EXPIRY_MIN, isValidEmail, isValidStudentId, normalizeStudentId } from '../utils/marsu';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const PENDING_KEY = 'mockPendingOtp';
const USER_KEY = 'mockUser';

function mockDelay(result, ms = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms));
}

function mockError(status, message, extra = {}) {
  const err = new Error(message);
  err.response = { status, data: { message, ...extra } };
  Object.assign(err, extra);
  return err;
}

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function readPending() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
  } catch {
    return null;
  }
}

// POST /api/auth/register — sa mock, gumawa ng pending OTP imbes na user agad.
export async function registerAccount({ name, email, password, studentId, course, yearLevel, section }) {
  const cleanEmail = email.trim().toLowerCase();
  // Kahit anong valid email ay pwede — ang Student ID ang batayan
  // kung lehitimong estudyante ng MarSU ang nagre-register.
  if (!isValidEmail(cleanEmail)) {
    throw mockError(400, 'Enter a valid email address.');
  }
  const cleanStudentId = normalizeStudentId(studentId);
  if (!isValidStudentId(cleanStudentId)) {
    throw mockError(400, 'Enter a valid MarSU Student ID (e.g. 2023-00123).');
  }
  if (useMock) {
    if (!name.trim() || !course || !yearLevel || !section.trim()) {
      throw mockError(400, 'Please complete name, course, year, and section.');
    }
    if (password.length < 6) throw mockError(400, 'Password must be at least 6 characters.');
    try {
      const existing = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      if (existing && existing.studentId === cleanStudentId) {
        throw mockError(400, 'This Student ID is already registered.');
      }
      const pendingDup = readPending();
      if (pendingDup?.fields?.studentId === cleanStudentId && pendingDup.email !== cleanEmail) {
        throw mockError(400, 'This Student ID already has a pending registration. Please verify the OTP.');
      }
    } catch (err) {
      if (err.response) throw err;
      // ignore parse errors
    }
    const otp = randomOtp();
    const pending = {
      email: cleanEmail,
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MIN * 60 * 1000,
      fields: { name: name.trim(), email: cleanEmail, studentId: cleanStudentId, course, yearLevel, section: section.trim() },
    };
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    // mockOtp ay pang-demo lang — sa tunay na backend, isi-send ito via Resend email.
    return mockDelay({ needsVerification: true, email: cleanEmail, mockOtp: otp });
  }
  const { data } = await api.post('/auth/register', {
    name,
    email: cleanEmail,
    password,
    studentId,
    course,
    yearLevel,
    section,
  });
  return data?.data;
}

// POST /api/auth/verify-otp
export async function verifyOtpAccount(email, otp) {
  const cleanEmail = email.trim().toLowerCase();
  if (useMock) {
    const pending = readPending();
    if (!pending || pending.email !== cleanEmail) {
      throw mockError(400, 'No pending verification for this email. Please register first.');
    }
    if (Date.now() > pending.expiresAt) {
      throw mockError(410, 'OTP has expired. Please resend a new one.');
    }
    if (pending.otp !== otp.trim()) {
      throw mockError(400, 'Incorrect OTP. Please check your email.');
    }
    const user = { ...pending.fields, _id: `u${Date.now()}`, isVerified: true };
    const accessToken = `mock-token-${Date.now()}`;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.removeItem(PENDING_KEY);
    return mockDelay({ user, accessToken });
  }
  const { data } = await api.post('/auth/verify-otp', { email: cleanEmail, otp });
  const payload = data?.data;
  if (payload?.accessToken) localStorage.setItem('accessToken', payload.accessToken);
  return payload;
}

// POST /api/auth/resend-otp
export async function resendOtpAccount(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (useMock) {
    const pending = readPending();
    if (!pending || pending.email !== cleanEmail) {
      throw mockError(400, 'No pending verification for this email.');
    }
    const otp = randomOtp();
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ ...pending, otp, expiresAt: Date.now() + OTP_EXPIRY_MIN * 60 * 1000 })
    );
    return mockDelay({ email: cleanEmail, mockOtp: otp });
  }
  const { data } = await api.post('/auth/resend-otp', { email: cleanEmail });
  return data?.data;
}

// POST /api/auth/login — may needsVerification flag kapag hindi pa verified.
export async function loginAccount(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  if (useMock) {
    const pending = readPending();
    if (pending && pending.email === cleanEmail) {
      throw mockError(403, 'Email not verified yet. Please enter the OTP sent to you.', {
        needsVerification: true,
        email: cleanEmail,
      });
    }
    try {
      const stored = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      if (stored && stored.email === cleanEmail) {
        const accessToken = `mock-token-${Date.now()}`;
        localStorage.setItem('accessToken', accessToken);
        return mockDelay({ user: stored, accessToken });
      }
    } catch {
      // ignore
    }
    throw mockError(401, 'Incorrect email or password. (Mock: please register first.)');
  }
  try {
    const { data } = await api.post('/auth/login', { email: cleanEmail, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data;
  } catch (err) {
    if (err.response?.status === 403 && err.response?.data?.needsVerification) {
      err.needsVerification = true;
    }
    throw err;
  }
}

export function readMockUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function clearMockSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('accessToken');
}

export function readPendingEmail() {
  return readPending()?.email || '';
}
