const User = require('../models/User');
const Step = require('../models/Step');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');

const LEGACY_POINTS_FILTER = {
  $or: [
    { pointsUnitVersion: { $exists: false } },
    { pointsUnitVersion: 1 },
  ],
};

const multiplyLegacyFields = (fields) => [{
  $set: {
    ...Object.fromEntries(fields.map((field) => [
      field,
      { $multiply: [{ $ifNull: [`$${field}`, 0] }, 10] },
    ])),
    pointsUnitVersion: 2,
  },
}];

const migratePointsToPaise = async () => {
  await Promise.all([
    User.updateMany(
      LEGACY_POINTS_FILTER,
      multiplyLegacyFields(['totalPoints', 'availablePoints', 'redeemedPoints'])
    ),
    Step.updateMany(LEGACY_POINTS_FILTER, multiplyLegacyFields(['pointsEarned'])),
    Reward.updateMany(LEGACY_POINTS_FILTER, multiplyLegacyFields(['pointsRequired'])),
    Redemption.updateMany(LEGACY_POINTS_FILTER, multiplyLegacyFields(['pointsUsed'])),
  ]);
};

module.exports = { migratePointsToPaise };
