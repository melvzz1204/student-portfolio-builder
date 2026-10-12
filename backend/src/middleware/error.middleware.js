const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, errors.array().map((e) => e.msg).join(', ')));
  }
  next();
};

const notFound = (req, res, next) => {
  next(new ApiError(404, `Not found - ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map((v) => v.message).join(', ');
    return res.status(400).json({ success: false, message: msg });
  }

  // Multer upload errors (file size, mimetype)
  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large (max 5MB)'
        : err.message || 'File upload failed';
    return res.status(400).json({ success: false, message });
  }
  if (err.message === 'Only PDF, JPG, PNG, or WebP files are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { validate, notFound, errorHandler };
