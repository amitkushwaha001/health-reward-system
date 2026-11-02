const jwt = require('jsonwebtoken');
const { REWARD_CONFIG } = require('../config/constants');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Send Token Response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      totalSteps: user.totalSteps,
      totalPoints: user.totalPoints,
      availablePoints: user.availablePoints,
      dailyStepGoal: user.dailyStepGoal,
      preferredWalkingTime: user.preferredWalkingTime,
    },
  });
};

// Balances and reward costs are integer paise to avoid fractional currency math.
const calculatePoints = (steps) => {
  const paise = steps * REWARD_CONFIG.PAISE_PER_STEP;
  if (!Number.isSafeInteger(paise)) {
    throw new Error('Step reward exceeds the safe integer range');
  }
  return paise;
};

const formatRupees = (paise) => `₹${(paise / 100).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const parseUtcDate = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return null;
    }
    return date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isValidStepCount = (value) => Number.isSafeInteger(value)
  && value >= 0
  && Number.isSafeInteger(value * REWARD_CONFIG.PAISE_PER_STEP);

module.exports = {
  generateToken,
  sendTokenResponse,
  calculatePoints,
  formatRupees,
  parseUtcDate,
  isValidStepCount,
};
