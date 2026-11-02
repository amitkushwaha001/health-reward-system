const mongoose = require('mongoose');

const RedemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: true,
    },
    pointsUsed: {
      type: Number,
      required: [true, 'Please provide points used'],
    },
    pointsUnitVersion: {
      type: Number,
      default: 2,
      select: false,
    },
    redemptionType: {
      type: String,
      enum: [
        'CASH',
        'MOVIE_TICKET',
        'SHOPPING_VOUCHER',
        'FOOD_COUPON',
        'TRAVEL_VOUCHER',
        'WELLNESS',
        'GIFT_CARD',
      ],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    redeemCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

RedemptionSchema.index({ userId: 1, createdAt: 1 });

module.exports = mongoose.model('Redemption', RedemptionSchema);
