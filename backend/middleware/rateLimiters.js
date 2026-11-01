const rateLimit = require('express-rate-limit');

const createRateLimiter = ({ windowMs, limit }) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT || 300),
});

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT || 10),
});

const aiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AI_RATE_LIMIT || 20),
});

module.exports = { apiLimiter, loginLimiter, aiLimiter, createRateLimiter };
