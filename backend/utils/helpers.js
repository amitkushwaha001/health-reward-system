const jwt = require('jsonwebtoken');

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

// Calculate Points from Steps
const calculatePoints = (steps) => {
  const ratio = Number(process.env.STEPS_TO_POINTS_RATIO || 100);
  if (!Number.isSafeInteger(ratio) || ratio < 1) {
    throw new Error('STEPS_TO_POINTS_RATIO must be a positive integer');
  }
  return Math.floor(steps / ratio);
};

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

const isValidStepCount = (value) => Number.isSafeInteger(value) && value >= 0;

module.exports = {
  generateToken,
  sendTokenResponse,
  calculatePoints,
  parseUtcDate,
  isValidStepCount,
};
