const User = require('../models/User');
const Step = require('../models/Step');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');

// @desc Get admin dashboard stats
// @route GET /api/admin/dashboard
// @access Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSteps = await Step.aggregate([
      { $group: { _id: null, total: { $sum: '$steps' } } },
    ]);
    const totalRewardsGenerated = await Step.aggregate([
      { $group: { _id: null, total: { $sum: '$pointsEarned' } } },
    ]);
    const totalRedemptions = await Redemption.countDocuments({ status: 'approved' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSteps: totalSteps[0]?.total || 0,
        totalRewardsGenerated: totalRewardsGenerated[0]?.total || 0,
        totalRedemptions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all users
// @route GET /api/admin/users
// @access Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let filter = { role: 'user' };

    if (search) {
      filter = {
        ...filter,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      pages: Math.ceil(totalUsers / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete user
// @route DELETE /api/admin/user/:id
// @access Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete user and related data
    await User.findByIdAndDelete(req.params.id);
    await Step.deleteMany({ userId: req.params.id });
    await Redemption.deleteMany({ userId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User and related data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Block/Unblock user
// @route PATCH /api/admin/block/:id
// @access Private/Admin
const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    const action = user.isBlocked ? 'blocked' : 'unblocked';

    res.status(200).json({
      success: true,
      data: user,
      message: `User ${action} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create reward
// @route POST /api/admin/rewards
// @access Private/Admin
const createReward = async (req, res, next) => {
  try {
    const { title, category, pointsRequired, value, description } = req.body;

    const reward = await Reward.create({
      title,
      category,
      pointsRequired,
      value,
      description,
    });

    res.status(201).json({
      success: true,
      data: reward,
      message: 'Reward created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update reward
// @route PUT /api/admin/rewards/:id
// @access Private/Admin
const updateReward = async (req, res, next) => {
  try {
    const { title, pointsRequired, value, description, isActive } = req.body;

    let reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    if (title) reward.title = title;
    if (pointsRequired) reward.pointsRequired = pointsRequired;
    if (value) reward.value = value;
    if (description) reward.description = description;
    if (isActive !== undefined) reward.isActive = isActive;

    await reward.save();

    res.status(200).json({
      success: true,
      data: reward,
      message: 'Reward updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete reward
// @route DELETE /api/admin/rewards/:id
// @access Private/Admin
const deleteReward = async (req, res, next) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);

    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Reward deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get reports
// @route GET /api/admin/reports
// @access Private/Admin
const getReports = async (req, res, next) => {
  try {
    // User activity report
    const userActivity = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalPoints: { $sum: '$totalPoints' },
          totalRedeemed: { $sum: '$redeemedPoints' },
        },
      },
    ]);

    // Reward transactions
    const rewardTransactions = await Step.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalSteps: { $sum: '$steps' },
          totalPoints: { $sum: '$pointsEarned' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    // Redemption history
    const redemptionHistory = await Redemption.aggregate([
      {
        $group: {
          _id: '$redemptionType',
          count: { $sum: 1 },
          totalPoints: { $sum: '$pointsUsed' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        userActivity: userActivity[0] || {},
        rewardTransactions,
        redemptionHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  deleteUser,
  blockUser,
  createReward,
  updateReward,
  deleteReward,
  getReports,
};
