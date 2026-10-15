// src/controllers/resume.controller.js
const Resume = require('../models/Resume');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get or create user resume
// @route   GET /api/resumes/me
// @access  Private
exports.getMyResume = asyncHandler(async (req, res) => {
  let resume = await Resume.findOneByUser(req.user.id);

  if (!resume) {
    resume = await Resume.create({
      userId: req.user.id,
      personalDetails: {
        fullName: req.user.name || '',
        email: req.user.email || '',
        jobTitle: req.user.headline || '',
        phone: req.user.phone || '',
        photo: req.user.avatar || '',
      },
    });
  }

  res.status(200).json({ success: true, data: resume.toJSON() });
});

// @desc    Update user resume
// @route   PUT /api/resumes/me
// @access  Private
exports.updateMyResume = asyncHandler(async (req, res) => {
  let resume = await Resume.findOneByUser(req.user.id);

  if (!resume) {
    resume = await Resume.create({ userId: req.user.id });
  }

  const {
    title,
    personalDetails,
    profile,
    employmentHistory,
    education,
    skills,
    references,
  } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (personalDetails !== undefined) updates.personalDetails = personalDetails;
  if (profile !== undefined) updates.profile = profile;
  if (employmentHistory !== undefined) updates.employmentHistory = employmentHistory;
  if (education !== undefined) updates.education = education;
  if (skills !== undefined) updates.skills = skills;
  if (references !== undefined) updates.references = references;

  await resume.save(updates);

  res.status(200).json({ success: true, data: resume.toJSON() });
});

// @desc    Get public resume by resume ID
// @route   GET /api/resumes/public/:id
// @access  Public
exports.getPublicResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  res.status(200).json({ success: true, data: resume.toJSON() });
});