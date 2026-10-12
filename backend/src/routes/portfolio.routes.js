const express = require('express');
const { param } = require('express-validator');
const { getMine, getPublic } = require('../controllers/portfolio.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/me', protect, getMine);
router.get(
  '/:slug',
  [param('slug').trim().notEmpty().withMessage('Slug is required')],
  validate,
  getPublic
);

module.exports = router;
