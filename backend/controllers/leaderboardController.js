const User = require('../models/User');
const Step = require('../models/Step');
const Redemption = require('../models/Redemption');

// @desc Get leaderboard
// @route GET /api/leaderboard
// @access Private
const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await User.find({ role: 'user', isBlocked: false })
      .select('name totalSteps totalPoints')
      .sort({ totalPoints: -1, totalSteps: -1 })
      .limit(10);

    // Add rank
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      totalSteps: user.totalSteps,
      totalPoints: user.totalPoints,
    }));

    res.status(200).json({
      success: true,
      count: rankedLeaderboard.length,
      data: rankedLeaderboard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get user rank and stats
// @route GET /api/leaderboard/user-rank
// @access Private
const getUserRank = async (req, res, next) => {
  try {
    const usersAbove = await User.countDocuments({
      totalPoints: { $gt: (await User.findById(req.user.id)).totalPoints },
      role: 'user',
      isBlocked: false,
    });

    const rank = usersAbove + 1;
    const user = await User.findById(req.user.id).select('name totalSteps totalPoints');

    res.status(200).json({
      success: true,
      data: {
        rank,
        ...user.toObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
  getUserRank,
};
