const express = require('express');
const { body } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const User = require('../models/User');

const router = express.Router();

// GET /api/users/profile
router.get(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user } });
  })
);

// PUT /api/users/profile — resume/profile editor (headline, bio, phone, skills, education)
router.put(
  '/profile',
  protect,
  [
    body('headline').optional().trim().isLength({ max: 120 }).withMessage('Headline is too long'),
    body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio is too long'),
    body('phone').optional().trim().isLength({ max: 30 }).withMessage('Phone is too long'),
    body('skills').optional().isArray({ max: 30 }).withMessage('Skills must be an array'),
    body('skills.*').optional().trim().isLength({ min: 1, max: 40 }).withMessage('Each skill must be 1–40 characters'),
    body('education').optional().isArray({ max: 10 }).withMessage('Education must be an array'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be true or false'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { headline, bio, phone, skills, education, isPublic } = req.body;
    const user = await User.findById(req.user._id);
    if (headline !== undefined) user.headline = headline;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (skills !== undefined) user.skills = skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 30);
    if (education !== undefined) {
      user.education = education.slice(0, 10).map((e) => ({
        school: String(e.school || '').trim(),
        degree: String(e.degree || '').trim(),
        startYear: String(e.startYear || '').trim(),
        endYear: String(e.endYear || '').trim(),
        details: String(e.details || '').trim(),
      }));
    }
    if (isPublic !== undefined) user.isPublic = isPublic;
    await user.save();
    res.json({ success: true, data: { user } });
  })
);

module.exports = router;
