const mongoose = require('mongoose');

const RewardCatalogStateSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  initializedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RewardCatalogState', RewardCatalogStateSchema);
