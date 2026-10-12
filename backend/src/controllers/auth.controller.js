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
  const payload = { id: user._id.toString() };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, studentId, course, yearLevel, section } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, 'Email already in use');
  }

  const existingId = await User.findOne({ studentId });
  if (existingId) {
    throw new ApiError(400, 'Student ID is already registered');
  }

  // Gumawa ng unique public slug para sa portfolio page (/p/:slug).
  let slug = buildSlug(name);
  while (await User.findOne({ slug })) {
    slug = buildSlug(name);
  }

  const user = await User.create({ name, email, password, studentId, course, yearLevel, section, slug });
  const { accessToken, refreshToken } = tokensForUser(user);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({ success: true, data: { user, accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
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

  // Redirect to your frontend dashboard/success route containing the access token if needed, 
  // or a frontend handler route (e.g., http://localhost:3000/auth-success?token=...)
  // For now, redirecting to a JSON response endpoint or frontend success page URL:
  res.redirect(`/api/auth/login-success?token=${accessToken}`);
});

const loginSuccess = asyncHandler(async (req, res) => {
  // If handled via session/passport or passed token query
  if (req.user) {
    const { accessToken } = tokensForUser(req.user);
    return res.json({
      success: true,
      message: 'Successfully logged in with Google',
      data: { user: req.user, accessToken },
    });
  }
  
  // Alternatively if token is passed via query params from redirect
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