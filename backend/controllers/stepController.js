const Step = require('../models/Step');
const User = require('../models/User');
const mongoose = require('mongoose');
const { calculatePoints, formatRupees, parseUtcDate, isValidStepCount } = require('../utils/helpers');

// @desc Add daily steps
// @route POST /api/steps/add
// @access Private
const addSteps = async (req, res, next) => {
  try {
    const { date, steps } = req.body;

    // Validate input
    const normalizedDate = parseUtcDate(date);
    if (!normalizedDate || !isValidStepCount(steps)) {
      return res.status(400).json({ success: false, message: 'Please provide date and steps' });
    }

    const pointsEarned = calculatePoints(steps);
    const session = await mongoose.startSession();
    let step;

    try {
      await session.withTransaction(async () => {
        step = await Step.findOne({ userId: req.user.id, date: normalizedDate }).session(session);
        if (step) {
          const oldSteps = step.steps;
          const oldPoints = step.pointsEarned;
          step.steps = steps;
          step.pointsEarned = pointsEarned;
          step.pointsUnitVersion = 2;
          await step.save({ session });
          await User.updateOne(
            { _id: req.user.id },
            { $inc: { totalSteps: steps - oldSteps, totalPoints: pointsEarned - oldPoints, availablePoints: pointsEarned - oldPoints } },
            { session }
          );
        } else {
          [step] = await Step.create([{
            userId: req.user.id,
            date: normalizedDate,
            steps,
            pointsEarned,
            pointsUnitVersion: 2,
          }], { session });
          await User.updateOne(
            { _id: req.user.id },
            { $inc: { totalSteps: steps, totalPoints: pointsEarned, availablePoints: pointsEarned } },
            { session }
          );
        }
      });
    } finally {
      await session.endSession();
    }

    res.status(201).json({
      success: true,
      data: step,
      message: `${steps} steps recorded! You earned ${formatRupees(pointsEarned)}.`,
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
      const parsedStart = startDate ? parseUtcDate(startDate) : null;
      const parsedEnd = endDate ? parseUtcDate(endDate) : null;
      if ((startDate && !parsedStart) || (endDate && !parsedEnd)) {
        return res.status(400).json({ success: false, message: 'Dates must be valid ISO dates' });
      }
      if (parsedStart) filter.date.$gte = parsedStart;
      if (parsedEnd) {
        parsedEnd.setUTCHours(23, 59, 59, 999);
        filter.date.$lte = parsedEnd;
      }
      if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
        return res.status(400).json({ success: false, message: 'startDate must be on or before endDate' });
      }
    }

    let query = Step.find(filter).sort({ date: -1 });
    if (req.query.limit !== undefined) {
      const limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
        return res.status(400).json({ success: false, message: 'limit must be an integer between 1 and 1000' });
      }
      query = query.limit(limit);
    }

    const steps = await query;

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

    if (!isValidStepCount(steps)) {
      return res.status(400).json({ success: false, message: 'steps must be a non-negative integer' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid step record ID' });
    }

    const session = await mongoose.startSession();
    let step;

    try {
      await session.withTransaction(async () => {
        step = await Step.findById(req.params.id).session(session);
        if (!step) return;

        if (step.userId.toString() !== req.user.id) return;

        const oldSteps = step.steps;
        const oldPoints = step.pointsEarned;
        const newPoints = calculatePoints(steps);

        step.steps = steps;
        step.pointsEarned = newPoints;
        step.pointsUnitVersion = 2;
        await step.save({ session });

        await User.updateOne(
          { _id: req.user.id },
          { $inc: { totalSteps: steps - oldSteps, totalPoints: newPoints - oldPoints, availablePoints: newPoints - oldPoints } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    if (!step) {
      return res.status(404).json({ success: false, message: 'Step record not found' });
    }
    if (step.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this record' });
    }

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid step record ID' });
    }

    const session = await mongoose.startSession();
    let step;

    try {
      await session.withTransaction(async () => {
        step = await Step.findById(req.params.id).session(session);
        if (!step || step.userId.toString() !== req.user.id) return;
        await Step.deleteOne({ _id: step._id }, { session });
        await User.updateOne(
          { _id: req.user.id },
          { $inc: { totalSteps: -step.steps, totalPoints: -step.pointsEarned, availablePoints: -step.pointsEarned } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    if (!step) {
      return res.status(404).json({ success: false, message: 'Step record not found' });
    }
    if (step.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this record' });
    }

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
