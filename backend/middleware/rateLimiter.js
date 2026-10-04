const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';
const authMaxAttempts = Number(process.env.AUTH_RATE_LIMIT_MAX)
  || (isProduction ? 10 : 1000);

// Strict rate limit for authentication (protects against brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: authMaxAttempts,
  message: {
    message: 'Too many login/registration attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.API_RATE_LIMIT_MAX) || (isProduction ? 200 : 1000),
  message: {
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter,
};