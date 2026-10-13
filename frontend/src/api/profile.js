import api from './client';
import { readMockUser } from './auth';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const PROFILE_KEY = 'mockProfile';

function mockDelay(result, ms = 250) {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms));
}

function slugFromName(name) {
  const base = String(name || 'student')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${base || 'student'}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedProfile() {
  const u = readMockUser() || {};
  return {
    name: u.name || 'MarSU Student',
    email: u.email || '',
    studentId: u.studentId || '',
    course: u.course || '',
    yearLevel: u.yearLevel || '',
    section: u.section || '',
    role: u.role || 'student',
    slug: u.slug || slugFromName(u.name),
    isPublic: true,
    headline: '',
    bio: '',
    phone: '',
    skills: [],
    education: [],
  };
}

function readProfile() {
  const seed = seedProfile();
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(seed));
      return seed;
    }
    // Panatilihing naka-sync ang account fields (name/email/ID/role) sa auth record.
    return { ...seed, ...JSON.parse(raw), name: seed.name, email: seed.email, studentId: seed.studentId, role: seed.role };
  } catch {
    return seed;
  }
}

export function avatarInitials(name) {
  return String(name || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function validateProfile({ headline, bio, phone, skills, education }) {
  if (headline !== undefined && headline.length > 120) return 'Masyadong mahaba ang headline (max 120).';
  if (bio !== undefined && bio.length > 1000) return 'Masyadong mahaba ang bio (max 1000).';
  if (phone !== undefined && phone.length > 30) return 'Masyadong mahaba ang phone number.';
  if (skills !== undefined) {
    if (!Array.isArray(skills) || skills.length > 30) return 'Hanggang 30 skills lang.';
    if (skills.some((s) => !String(s).trim() || String(s).trim().length > 40))
      return 'Bawat skill ay 1–40 characters lang.';
  }
  if (education !== undefined && (!Array.isArray(education) || education.length > 10))
    return 'Hanggang 10 education entries lang.';
  return '';
}

// GET /api/users/profile
export async function getMyProfile() {
  if (useMock) return mockDelay(readProfile());
  const { data } = await api.get('/users/profile');
  return data?.data?.user || data?.data;
}

// PUT /api/users/profile — resume editor
export async function updateMyProfile({ headline, bio, phone, skills, education, isPublic }) {
  if (useMock) {
    const msg = validateProfile({ headline, bio, phone, skills, education });
    if (msg) {
      const err = new Error(msg);
      err.response = { status: 400, data: { message: msg } };
      throw err;
    }
    const current = readProfile();
    const next = {
      ...current,
      ...(headline !== undefined ? { headline } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(skills !== undefined ? { skills: skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 30) } : {}),
      ...(education !== undefined
        ? {
            education: education.slice(0, 10).map((e) => ({
              school: String(e.school || '').trim(),
              degree: String(e.degree || '').trim(),
              startYear: String(e.startYear || '').trim(),
              endYear: String(e.endYear || '').trim(),
              details: String(e.details || '').trim(),
            })),
          }
        : {}),
      ...(isPublic !== undefined ? { isPublic: !!isPublic } : {}),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    return mockDelay(next);
  }
  const { data } = await api.put('/users/profile', { headline, bio, phone, skills, education, isPublic });
  return data?.data?.user || data?.data;
}
