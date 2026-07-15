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
    },
  });
};

// Calculate Points from Steps
const calculatePoints = (steps) => {
  const ratio = parseInt(process.env.STEPS_TO_POINTS_RATIO || 100);
  return Math.floor(steps / ratio);
};

module.exports = {
  generateToken,
  sendTokenResponse,
  calculatePoints,
};
