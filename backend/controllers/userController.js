const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc Update user profile
// @route PUT /api/user/profile
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, dailyStepGoal, preferredWalkingTime } = req.body || {};

    const fieldsToUpdate = {};
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return res.status(400).json({ success: false, message: 'name must be a string' });
      }
      fieldsToUpdate.name = name;
    }
    if (email !== undefined) {
      if (typeof email !== 'string') {
        return res.status(400).json({ success: false, message: 'email must be a string' });
      }
      fieldsToUpdate.email = email.trim().toLowerCase();
    }
    if (dailyStepGoal !== undefined) {
      if (dailyStepGoal !== null && (!Number.isSafeInteger(dailyStepGoal) || dailyStepGoal < 1 || dailyStepGoal > 1000000)) {
        return res.status(400).json({ success: false, message: 'dailyStepGoal must be a positive integer no greater than 1000000, or null' });
      }
      fieldsToUpdate.dailyStepGoal = dailyStepGoal;
    }
    if (preferredWalkingTime !== undefined) {
      if (![null, 'morning', 'midday', 'evening', 'flexible'].includes(preferredWalkingTime)) {
        return res.status(400).json({ success: false, message: 'preferredWalkingTime must be morning, midday, evening, flexible, or null' });
      }
      fieldsToUpdate.preferredWalkingTime = preferredWalkingTime;
    }
    if (!Object.keys(fieldsToUpdate).length) {
      return res.status(400).json({ success: false, message: 'Provide at least one profile field to update' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Change password
// @route PUT /api/user/change-password
// @access Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all password fields' });
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  changePassword,
};
