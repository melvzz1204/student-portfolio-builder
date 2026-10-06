const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');

const router = express.Router();

// Example protected route: GET /api/users/profile
router.get(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user } });
  })
);

module.exports = router;
