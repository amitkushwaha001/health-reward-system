const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    category: {
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
      required: [true, 'Please provide a category'],
    },
    catalogKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    pointsRequired: {
      type: Number,
      required: [true, 'Please provide points required'],
      min: [1, 'Points required must be at least 1'],
      validate: {
        validator: Number.isSafeInteger,
        message: 'Reward cost must be a whole number of paise',
      },
    },
    pointsUnitVersion: {
      type: Number,
      default: 2,
      select: false,
    },
    value: {
      type: Number,
      required: [true, 'Please provide a value'],
    },
    currency: {
      type: String,
      default: '₹',
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model('Reward', RewardSchema);
