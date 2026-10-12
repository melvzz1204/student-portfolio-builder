// src/routes/auth.routes.js
const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { 
  register, 
  login, 
  getMe, 
  refresh, 
  logout, 
  googleCallback, 
  loginSuccess 
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    // Student ID ang batayan ng pagiging lehitimong MarSU student —
    // kahit anong valid email ay pwede.
    body('studentId')
      .trim()
      .notEmpty()
      .withMessage('Student ID is required')
      .matches(/^\d{4}-\d{5}$/)
      .withMessage('Student ID must follow the YYYY-NNNNN format (e.g. 2023-00123)'),
    body('course').optional().trim(),
    body('yearLevel').optional().trim(),
    body('section').optional().trim(),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);
router.post('/refresh', refresh);
router.post('/logout', logout);

// --- Google OAuth Routes ---

// 1. Initiates the Google OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Google OAuth callback route
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

// 3. Login success data route
router.get('/login-success', loginSuccess);

module.exports = router;