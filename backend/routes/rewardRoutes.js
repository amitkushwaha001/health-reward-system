const express = require('express');
const {
  getRewards,
  redeemReward,
  getRedemptionHistory,
} = require('../controllers/rewardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getRewards);
router.post('/redeem', protect, redeemReward);
router.get('/history', protect, getRedemptionHistory);

module.exports = router;
