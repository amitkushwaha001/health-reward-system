const Step = require('../models/Step');
const Redemption = require('../models/Redemption');
const User = require('../models/User');
const { parseUtcDate } = require('../utils/helpers');
const { buildAnalytics } = require('../utils/analytics');

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DAYS = { daily: 13, weekly: 83, monthly: 335 };
const MAX_BUCKETS = { daily: 366, weekly: 105, monthly: 36 };

const getRange = (query) => {
  const range = query.range || 'daily';
  if (!Object.hasOwn(DEFAULT_DAYS, range)) {
    return { error: 'range must be daily, weekly, or monthly' };
  }

  const today = new Date();
  const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  let startDate = query.startDate ? parseUtcDate(query.startDate) : null;
  let endDate = query.endDate ? parseUtcDate(query.endDate) : null;
  if ((query.startDate && !startDate) || (query.endDate && !endDate)) {
    return { error: 'startDate and endDate must be valid ISO dates' };
  }

  if (!startDate && !endDate) {
    endDate = todayStart;
    startDate = new Date(todayStart.getTime() - DEFAULT_DAYS[range] * DAY_MS);
  } else if (!startDate) {
    startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - DEFAULT_DAYS[range]);
  } else if (!endDate) {
    endDate = todayStart;
  }

  startDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  endDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999));
  if (startDate > endDate) return { error: 'startDate must be on or before endDate' };

  const buckets = buildAnalytics({
    range,
    startDate,
    endDate,
    stepRecords: [],
    redemptions: [],
  }).buckets;
  if (buckets.length > MAX_BUCKETS[range]) {
    return { error: `Date range is too large for ${range} analytics` };
  }

  return { range, startDate, endDate };
};

const getActivityAnalytics = async (req, res, next) => {
  try {
    const period = getRange(req.query);
    if (period.error) {
      return res.status(400).json({ success: false, message: period.error });
    }

    const heatmapStart = new Date(Date.UTC(period.endDate.getUTCFullYear(), period.endDate.getUTCMonth(), 1));
    const heatmapEnd = new Date(Date.UTC(period.endDate.getUTCFullYear(), period.endDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    const [stepRecords, redemptions, user, heatmapRecords] = await Promise.all([
      Step.find({
        userId: req.user.id,
        date: { $gte: period.startDate, $lte: period.endDate },
      }).select('date steps pointsEarned').sort({ date: 1 }).lean(),
      Redemption.find({
        userId: req.user.id,
        createdAt: { $gte: period.startDate, $lte: period.endDate },
      }).select('createdAt pointsUsed').sort({ createdAt: 1 }).lean(),
      User.findById(req.user.id).select('dailyStepGoal').lean(),
      Step.find({
        userId: req.user.id,
        date: { $gte: heatmapStart, $lte: heatmapEnd },
      }).select('date steps').lean(),
    ]);

    const analytics = buildAnalytics({
      ...period,
      stepRecords,
      redemptions,
      dailyStepGoal: user?.dailyStepGoal,
      heatmapRecords,
    });

    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getActivityAnalytics, getRange };
