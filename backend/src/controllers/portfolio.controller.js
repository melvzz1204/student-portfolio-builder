const Achievement = require('../models/Achievement');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function avatarInitials(name) {
  return String(name || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function toPortfolio(user, achievements) {
  const u = typeof user.toJSON === 'function' ? user.toJSON() : user;
  return {
    ...u,
    avatarInitials: avatarInitials(u.name),
    achievements: achievements || [],
  };
}

// GET /api/portfolios/me — buong portfolio ng naka-login (profile + achievements)
const getMine = asyncHandler(async (req, res) => {
  const achievements = await Achievement.find({ user: req.user._id }).sort({
    dateReceived: -1,
    createdAt: -1,
  });
  res.json({ success: true, data: { portfolio: toPortfolio(req.user, achievements) } });
});

// GET /api/portfolios/:slug — public portfolio page
const getPublic = asyncHandler(async (req, res) => {
  const user = await User.findOne({ slug: String(req.params.slug).toLowerCase() }).select('-password');
  if (!user || user.isPublic === false) {
    throw new ApiError(404, 'Portfolio not found');
  }
  const achievements = await Achievement.find({ user: user._id }).sort({
    dateReceived: -1,
    createdAt: -1,
  });
  res.json({ success: true, data: { portfolio: toPortfolio(user, achievements) } });
});

module.exports = { getMine, getPublic };
