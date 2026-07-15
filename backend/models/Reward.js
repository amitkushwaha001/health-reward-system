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
      enum: ['CASH', 'MOVIE_TICKET', 'SHOPPING_VOUCHER', 'FOOD_COUPON'],
      required: [true, 'Please provide a category'],
    },
    pointsRequired: {
      type: Number,
      required: [true, 'Please provide points required'],
      min: [1, 'Points required must be at least 1'],
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
