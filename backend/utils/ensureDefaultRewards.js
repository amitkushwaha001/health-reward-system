const Reward = require('../models/Reward');
const RewardCatalogState = require('../models/RewardCatalogState');

const CATALOG_STATE_KEY = 'starter-rewards-v2-paise';

const DEFAULT_REWARDS = [
  {
    catalogKey: 'starter-cash-10',
    pointsUnitVersion: 2,
    title: '₹10 Reward Credit',
    category: 'CASH',
    pointsRequired: 1000,
    value: 10,
    currency: '₹',
    description: 'A starter reward credit. Redemption creates an in-app code; cash transfer is not connected.',
  },
  {
    catalogKey: 'starter-shopping-50',
    pointsUnitVersion: 2,
    title: '₹50 Shopping Voucher',
    category: 'SHOPPING_VOUCHER',
    pointsRequired: 5000,
    value: 50,
    currency: '₹',
    description: 'A sample shopping voucher reward. External voucher delivery is not connected.',
  },
  {
    catalogKey: 'starter-shopping-100',
    pointsUnitVersion: 2,
    title: '₹100 Shopping Voucher',
    category: 'SHOPPING_VOUCHER',
    pointsRequired: 10000,
    value: 100,
    currency: '₹',
    description: 'A sample shopping voucher reward. External voucher delivery is not connected.',
  },
  {
    catalogKey: 'starter-travel-50',
    pointsUnitVersion: 2,
    title: '₹50 Travel Voucher',
    category: 'TRAVEL_VOUCHER',
    pointsRequired: 5000,
    value: 50,
    currency: '₹',
    description: 'A sample travel voucher reward. Booking and partner fulfillment are not connected.',
  },
  {
    catalogKey: 'starter-travel-100',
    pointsUnitVersion: 2,
    title: '₹100 Travel Voucher',
    category: 'TRAVEL_VOUCHER',
    pointsRequired: 10000,
    value: 100,
    currency: '₹',
    description: 'A sample travel voucher reward. Booking and partner fulfillment are not connected.',
  },
  {
    catalogKey: 'starter-food-50',
    pointsUnitVersion: 2,
    title: '₹50 Food Coupon',
    category: 'FOOD_COUPON',
    pointsRequired: 5000,
    value: 50,
    currency: '₹',
    description: 'A sample food coupon reward. External coupon delivery is not connected.',
  },
  {
    catalogKey: 'starter-movie-ticket',
    pointsUnitVersion: 2,
    title: 'Movie Ticket',
    category: 'MOVIE_TICKET',
    pointsRequired: 5000,
    value: 1,
    currency: '',
    description: 'One sample movie ticket reward. Ticket booking and delivery are not connected.',
  },
  {
    catalogKey: 'starter-wellness-100',
    pointsUnitVersion: 2,
    title: '₹100 Wellness Voucher',
    category: 'WELLNESS',
    pointsRequired: 10000,
    value: 100,
    currency: '₹',
    description: 'A sample wellness voucher reward. External partner fulfillment is not connected.',
  },
  {
    catalogKey: 'starter-gift-card-50',
    pointsUnitVersion: 2,
    title: '₹50 Gift Card',
    category: 'GIFT_CARD',
    pointsRequired: 5000,
    value: 50,
    currency: '₹',
    description: 'A sample gift card reward. External gift-card delivery is not connected.',
  },
];

const ensureDefaultRewards = async () => {
  await Promise.all([Reward.init(), RewardCatalogState.init()]);

  if (await RewardCatalogState.exists({ key: CATALOG_STATE_KEY })) return;

  const operations = DEFAULT_REWARDS.map((reward) => ({
    updateOne: {
      filter: { catalogKey: reward.catalogKey },
      update: { $setOnInsert: reward },
      upsert: true,
    },
  }));

  for (let attempt = 0; ; attempt += 1) {
    try {
      await Reward.bulkWrite(operations, { ordered: true });
      break;
    } catch (error) {
      if (error.code !== 11000 || attempt >= 2) throw error;
    }
  }

  try {
    await RewardCatalogState.create({ key: CATALOG_STATE_KEY });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
};

module.exports = { DEFAULT_REWARDS, ensureDefaultRewards };
