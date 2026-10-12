const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const achievementRoutes = require('./routes/achievements.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security + parsing
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Basic rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/portfolios', portfolioRoutes);

// Uploaded proof files (PDF/images) — naka-mount sa /api para gumana
// rin sa Vite dev proxy at same-origin deployments.
app.use('/api/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 404 + centralized errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
