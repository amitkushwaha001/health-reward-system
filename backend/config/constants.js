// Reward Configuration
const REWARD_CONFIG = {
  STEPS_TO_POINTS_RATIO: 100, // 100 steps = 1 point
};

// Reward Categories and Rates
const REWARD_CATEGORIES = {
  CASH: {
    name: 'Cash Redemption',
    pointsRequired: 100,
    value: 10,
    currency: '₹',
  },
  MOVIE_TICKET: {
    name: 'Movie Tickets',
    pointsRequired: 500,
    value: 1,
    unit: 'ticket',
  },
  SHOPPING_VOUCHER: {
    name: 'Shopping Voucher',
    pointsRequired: 1000,
    value: 100,
    currency: '₹',
  },
  FOOD_COUPON: {
    name: 'Food Coupon',
    pointsRequired: 300,
    value: 50,
    currency: '₹',
  },
};

// User Roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Redemption Status
const REDEMPTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};

module.exports = {
  REWARD_CONFIG,
  REWARD_CATEGORIES,
  USER_ROLES,
  REDEMPTION_STATUS,
};
