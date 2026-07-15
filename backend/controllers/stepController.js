const Step = require('../models/Step');
const User = require('../models/User');
const { calculatePoints } = require('../utils/helpers');

// @desc Add daily steps
// @route POST /api/steps/add
// @access Private
const addSteps = async (req, res, next) => {
  try {
    const { date, steps } = req.body;

    // Validate input
    if (!date || steps === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide date and steps' });
    }

    // Calculate points
    const pointsEarned = calculatePoints(steps);

    // Create step record
    let step = await Step.findOne({ userId: req.user.id, date: new Date(date).toDateString() });

    if (step) {
      // Update existing record
      const oldPoints = step.pointsEarned;
      step.steps = steps;
      step.pointsEarned = pointsEarned;
      await step.save();

      // Update user points
      const user = await User.findById(req.user.id);
      user.availablePoints = user.availablePoints - oldPoints + pointsEarned;
      user.totalPoints = user.totalPoints - oldPoints + pointsEarned;
      user.totalSteps = user.totalSteps - step.steps + steps;
      await user.save();
    } else {
      // Create new record
      step = await Step.create({
        userId: req.user.id,
        date: new Date(date),
        steps,
        pointsEarned,
      });

      // Update user stats
      const user = await User.findById(req.user.id);
      user.totalSteps += steps;
      user.totalPoints += pointsEarned;
      user.availablePoints += pointsEarned;
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: step,
      message: `${steps} steps recorded! You earned ${pointsEarned} points.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get step history
// @route GET /api/steps/history
// @access Private
const getStepHistory = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { userId: req.user.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const steps = await Step.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: steps.length,
      data: steps,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update steps
// @route PUT /api/steps/update/:id
// @access Private
const updateSteps = async (req, res, next) => {
  try {
    const { steps } = req.body;

    if (steps === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide steps' });
    }

    let step = await Step.findById(req.params.id);

    if (!step) {
      return res.status(404).json({ success: false, message: 'Step record not found' });
    }

    // Check if user owns this record
    if (step.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this record' });
    }

    const oldSteps = step.steps;
    const oldPoints = step.pointsEarned;
    const newPoints = calculatePoints(steps);

    step.steps = steps;
    step.pointsEarned = newPoints;
    await step.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    user.totalSteps = user.totalSteps - oldSteps + steps;
    user.totalPoints = user.totalPoints - oldPoints + newPoints;
    user.availablePoints = user.availablePoints - oldPoints + newPoints;
    await user.save();

    res.status(200).json({
      success: true,
      data: step,
      message: 'Steps updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete steps
// @route DELETE /api/steps/delete/:id
// @access Private
const deleteSteps = async (req, res, next) => {
  try {
    const step = await Step.findById(req.params.id);

    if (!step) {
      return res.status(404).json({ success: false, message: 'Step record not found' });
    }

    // Check if user owns this record
    if (step.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this record' });
    }

    await Step.findByIdAndDelete(req.params.id);

    // Update user stats
    const user = await User.findById(req.user.id);
    user.totalSteps -= step.steps;
    user.totalPoints -= step.pointsEarned;
    user.availablePoints -= step.pointsEarned;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Step record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addSteps,
  getStepHistory,
  updateSteps,
  deleteSteps,
};
