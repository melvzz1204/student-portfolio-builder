const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, refresh, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['student', 'alumni'])
      .withMessage('Account type must be either student or alumni'),
    // Student ID ang batayan ng pagiging lehitimong MarSU student —
    // hindi ito hinihingi sa mga alumni (role: 'alumni').
    body('studentId')
      .trim()
      .custom((value, { req }) => {
        if (req.body.role === 'alumni') return true;
        if (!value) throw new Error('Student ID is required');
        if (!/^\d{4}-\d{5}$/.test(value)) {
          throw new Error('Student ID must follow the YYYY-NNNNN format (e.g. 2023-00123)');
        }
        return true;
      }),
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

module.exports = router;
