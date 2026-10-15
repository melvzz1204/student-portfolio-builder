// src/routes/resume.routes.js
const express = require('express');
const {
  getMyResume,
  updateMyResume,
  getPublicResume,
} = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/me')
  .get(protect, getMyResume)
  .put(protect, updateMyResume);

router.get('/public/:id', getPublicResume);

module.exports = router;