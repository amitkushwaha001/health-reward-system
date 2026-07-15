const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
    },
    steps: {
      type: Number,
      required: [true, 'Please provide step count'],
      min: [0, 'Steps cannot be negative'],
    },
    pointsEarned: {
      type: Number,
      default: 0,
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

// Create compound index for userId and date
StepSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Step', StepSchema);
