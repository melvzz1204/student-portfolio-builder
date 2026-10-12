export const MARSU_DOMAIN = 'marsu.edu.ph';

export function isMarsuEmail(email) {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith(`@${MARSU_DOMAIN}`);
}

export function isValidEmail(email) {
  if (!email) return false;
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

// MarSU Student ID format: YYYY-NNNNN (hal. 2023-00123).
// Ito ang batayan kung lehitimong estudyante ng MarSU ang nagre-register —
// hindi ang email domain.
export const STUDENT_ID_RE = /^\d{4}-\d{5}$/;
export const STUDENT_ID_EXAMPLE = '2023-00123';

export function normalizeStudentId(id) {
  if (!id) return '';
  const digits = String(id).replace(/\D/g, '');
  if (digits.length !== 9) return String(id).trim().toUpperCase();
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export function isValidStudentId(id) {
  if (!id) return false;
  return STUDENT_ID_RE.test(normalizeStudentId(id));
}

// Panimulang listahan — pwedeng dagdagan kapag may opisyal na listahan ang MarSU.
export const COURSES = [
  'BSIT',
  'BSCS',
  'BSIS',
  'BEED',
  'BSED',
  'BSBA',
  'BSHM',
  'BSTourM',
  'BSA',
  'BSFisheries',
  'BSAgri',
  'BSNursing',
  'BSCrim',
  'Other',
];

export const YEAR_LEVELS = ['1st', '2nd', '3rd', '4th', '5th'];

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MIN = 10;
export const RESEND_COOLDOWN_S = 60;
