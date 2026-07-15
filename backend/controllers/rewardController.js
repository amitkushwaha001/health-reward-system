const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const User = require('../models/User');
const crypto = require('crypto');

// @desc Get all available rewards
// @route GET /api/rewards
// @access Private
const getRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Redeem reward
// @route POST /api/rewards/redeem
// @access Private
const redeemReward = async (req, res, next) => {
  try {
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({ success: false, message: 'Please provide reward ID' });
    }

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    const user = await User.findById(req.user.id);

    // Check if user has enough points
    if (user.availablePoints < reward.pointsRequired) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You need ${reward.pointsRequired} points but have ${user.availablePoints}`,
      });
    }

    // Generate unique redeem code
    const redeemCode = 'RDM' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create redemption record
    const redemption = await Redemption.create({
      userId: req.user.id,
      rewardId: rewardId,
      pointsUsed: reward.pointsRequired,
      redemptionType: reward.category,
      value: reward.value,
      redeemCode,
      status: 'approved',
    });

    // Update user points
    user.availablePoints -= reward.pointsRequired;
    user.redeemedPoints += reward.pointsRequired;
    await user.save();

    res.status(201).json({
      success: true,
      data: redemption,
      message: `Successfully redeemed ${reward.title}! Your redeem code is: ${redeemCode}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get redemption history
// @route GET /api/rewards/history
// @access Private
const getRedemptionHistory = async (req, res, next) => {
  try {
    const redemptions = await Redemption.find({ userId: req.user.id })
      .populate('rewardId', 'title category value')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: redemptions.length,
      data: redemptions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRewards,
  redeemReward,
  getRedemptionHistory,
};
