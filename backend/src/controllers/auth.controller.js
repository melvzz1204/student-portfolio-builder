// src/controllers/auth.controller.js
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { buildSlug } = require('../utils/slug');
const env = require('../config/env');

const isProd = env.nodeEnv === 'production';

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  });
};

const tokensForUser = (user) => {
  const payload = { id: user.id }; // Supabase uses string/UUID 'id'
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, studentId, course, yearLevel, section } = req.body;

  const existing = await User.findOneByEmail(email);
  if (existing) {
    throw new ApiError(400, 'Email already in use');
  }

  // Check if studentId is already registered in Supabase
  if (studentId) {
    const supabase = require('../config/supabase');
    const { data: existingId } = await supabase
      .from('users')
      .select('id')
      .eq('student_id', studentId.toUpperCase())
      .single();

    if (existingId) {
      throw new ApiError(400, 'Student ID is already registered');
    }
  }

  // Gumawa ng unique public slug para sa portfolio page (/p/:slug).
  let slug = buildSlug(name);
  const supabase = require('../config/supabase');
  while (true) {
    const { data: slugCheck } = await supabase.from('users').select('id').eq('slug', slug).single();
    if (!slugCheck) break;
    slug = buildSlug(name) + '-' + Math.random().toString(36).substring(2, 6);
  }

  const user = await User.create({ name, email, password, studentId, course, yearLevel, section, slug });
  const { accessToken, refreshToken } = tokensForUser(user);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({ success: true, data: { user: user.toJSON(), accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Pass true to include password for verification comparison
  const user = await User.findOneByEmail(email, true);
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = tokensForUser(user);
  setRefreshCookie(res, refreshToken);

  res.json({ success: true, data: { user: user.toJSON(), accessToken } });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) {
    throw new ApiError(401, 'No refresh token provided');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  const { accessToken, refreshToken } = tokensForUser(user);
  setRefreshCookie(res, refreshToken);

  res.json({ success: true, data: { accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// --- Google OAuth Handlers ---

const googleCallback = asyncHandler(async (req, res) => {
  // Passport attaches the authenticated user to req.user
  if (!req.user) {
    throw new ApiError(401, 'Google authentication failed');
  }

  const { accessToken, refreshToken } = tokensForUser(req.user);
  setRefreshCookie(res, refreshToken);

  res.redirect(`/api/auth/login-success?token=${accessToken}`);
});

const loginSuccess = asyncHandler(async (req, res) => {
  if (req.user) {
    const { accessToken } = tokensForUser(req.user);
    return res.json({
      success: true,
      message: 'Successfully logged in with Google',
      data: { user: req.user.toJSON ? req.user.toJSON() : req.user, accessToken },
    });
  }
  
  const token = req.query.token;
  if (token) {
    return res.json({
      success: true,
      message: 'Successfully logged in with Google',
      data: { accessToken },
    });
  }

  throw new ApiError(401, 'Not Authorized');
});

module.exports = { 
  register, 
  login, 
  getMe, 
  refresh, 
  logout, 
  googleCallback, 
  loginSuccess 
};