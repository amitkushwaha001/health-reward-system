// Reward balances and reward prices are stored in paise.
const REWARD_CONFIG = {
  PAISE_PER_STEP: 10,
};

// Reward Categories and Rates
const REWARD_CATEGORIES = {
  CASH: {
    name: 'Cash Redemption',
    pointsRequired: 1000,
    value: 10,
    currency: '₹',
  },
  MOVIE_TICKET: {
    name: 'Movie Tickets',
    pointsRequired: 5000,
    value: 1,
    unit: 'ticket',
  },
  SHOPPING_VOUCHER: {
    name: 'Shopping Voucher',
    pointsRequired: 10000,
    value: 100,
    currency: '₹',
  },
  FOOD_COUPON: {
    name: 'Food Coupon',
    pointsRequired: 5000,
    value: 50,
    currency: '₹',
  },
  TRAVEL_VOUCHER: {
    name: 'Travel Voucher',
    pointsRequired: 5000,
    value: 50,
    currency: '₹',
  },
  WELLNESS: {
    name: 'Wellness Voucher',
    pointsRequired: 10000,
    value: 100,
    currency: '₹',
  },
  GIFT_CARD: {
    name: 'Gift Card',
    pointsRequired: 5000,
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
