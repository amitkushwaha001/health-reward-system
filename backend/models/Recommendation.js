const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    key: { type: String, required: true, maxlength: 80 },
    dateKey: { type: String, required: true },
    title: { type: String, required: true, maxlength: 120 },
    explanation: { type: String, required: true, maxlength: 500 },
    expectedBenefit: { type: String, required: true, maxlength: 250 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    suggestedAction: { type: String, required: true, maxlength: 300 },
    targetStepGoal: { type: Number, min: 1, max: 1000000, default: null },
    status: { type: String, enum: ['pending', 'accepted', 'dismissed', 'completed'], default: 'pending' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

RecommendationSchema.index({ userId: 1, dateKey: 1, key: 1 }, { unique: true });
RecommendationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Recommendation', RecommendationSchema);
