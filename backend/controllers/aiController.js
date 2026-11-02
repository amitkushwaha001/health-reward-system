const mongoose = require('mongoose');
const AIConversation = require('../models/AIConversation');
const Recommendation = require('../models/Recommendation');
const Reward = require('../models/Reward');
const Step = require('../models/Step');
const User = require('../models/User');
const { generateRecommendationDrafts } = require('../utils/recommendationEngine');
const { formatRupees } = require('../utils/helpers');

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CHAT_HISTORY = 60;
const MAX_MESSAGE_LENGTH = 1000;

const getSevenDayWindow = (now = new Date()) => {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  const start = new Date(end.getTime() - (6 * DAY_MS));
  start.setUTCHours(0, 0, 0, 0);
  return { start, end };
};

const getUserActivity = async (userId, now = new Date()) => {
  const { start, end } = getSevenDayWindow(now);
  const steps = await Step.find({ userId, date: { $gte: start, $lte: end } })
    .select('date steps pointsEarned')
    .sort({ date: 1 })
    .lean();
  const loggedDays = new Set(steps.map((step) => step.date.toISOString().slice(0, 10))).size;
  const totalSteps = steps.reduce((sum, step) => sum + step.steps, 0);
  return {
    steps,
    start,
    end,
    loggedDays,
    totalSteps,
    averageStepsPerLoggedDay: loggedDays ? Math.round(totalSteps / loggedDays) : null,
  };
};

const getInsights = async (req, res, next) => {
  try {
    const [user, activity] = await Promise.all([
      User.findById(req.user.id).select('dailyStepGoal availablePoints'),
      getUserActivity(req.user.id),
    ]);

    const todayKey = new Date().toISOString().slice(0, 10);
    const todayRecord = activity.steps.find((step) => step.date.toISOString().slice(0, 10) === todayKey);
    const insights = [];
    if (activity.loggedDays) {
      insights.push(`You recorded ${activity.totalSteps.toLocaleString()} steps across ${activity.loggedDays} of the last 7 calendar days.`);
      insights.push(`Your average on recorded days was ${activity.averageStepsPerLoggedDay.toLocaleString()} steps.`);
    } else {
      insights.push('There are no step records in the last 7 calendar days, so personal trend estimates are unavailable.');
    }

    return res.status(200).json({
      success: true,
      data: {
        insights,
        dailyStepGoal: user?.dailyStepGoal || null,
        availablePoints: user?.availablePoints ?? null,
        today: {
          steps: todayRecord ? todayRecord.steps : null,
          goalProgressPercent: todayRecord && user?.dailyStepGoal
            ? Math.min(100, Math.round((todayRecord.steps / user.dailyStepGoal) * 100))
            : null,
        },
        weeklyPlan: activity.loggedDays
          ? {
            basis: 'Suggested from your logged-day average; no schedule or account settings are changed.',
            days: 3,
            suggestedStepsPerActiveDay: activity.averageStepsPerLoggedDay,
          }
          : null,
        progressProjection: activity.loggedDays
          ? {
            isEstimate: true,
            projectedWeeklySteps: activity.averageStepsPerLoggedDay * 7,
            basis: 'An illustrative projection assuming your recent recorded-day average continues for 7 days; it is not a prediction.',
          }
          : null,
        disclaimer: 'Activity summaries and projections are informational only, not medical advice. Estimates are not measured values.',
      },
    });
  } catch (error) {
    return next(error);
  }
};

const generateRecommendations = async (req, res, next) => {
  try {
    const [user, steps, rewards] = await Promise.all([
      User.findById(req.user.id).select('dailyStepGoal preferredWalkingTime availablePoints'),
      Step.find({
        userId: req.user.id,
        date: { $gte: new Date(Date.now() - 13 * DAY_MS), $lte: new Date() },
      }).select('date steps').sort({ date: 1 }).lean(),
      Reward.find({ isActive: true }).select('title category pointsRequired value currency isActive').lean(),
    ]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const dateKey = new Date().toISOString().slice(0, 10);
    const drafts = generateRecommendationDrafts({ user, steps, rewards });
    const recommendations = [];
    for (const draft of drafts) {
      const filter = { userId: req.user.id, dateKey, key: draft.key };
      try {
        const recommendation = await Recommendation.findOneAndUpdate(
          filter,
          { $setOnInsert: { ...draft, userId: req.user.id, dateKey } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        recommendations.push(recommendation);
      } catch (error) {
        if (error.code !== 11000) throw error;
        const recommendation = await Recommendation.findOne(filter);
        if (!recommendation) throw error;
        recommendations.push(recommendation);
      }
    }

    return res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    return next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const dateKey = new Date().toISOString().slice(0, 10);
    const recommendations = await Recommendation.find({ userId: req.user.id, dateKey }).sort({ createdAt: 1 }).lean();
    return res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    return next(error);
  }
};

const getRecommendationHistory = async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ success: false, message: 'limit must be an integer between 1 and 100' });
    }
    const recommendations = await Recommendation.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    return next(error);
  }
};

const updateRecommendationStatus = async (req, res, next) => {
  try {
    const status = req.body?.status;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid recommendation ID' });
    }
    if (!['accepted', 'dismissed', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be accepted, dismissed, or completed' });
    }

    const recommendation = await Recommendation.findOne({ _id: req.params.id, userId: req.user.id });
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }
    const transitions = {
      pending: ['accepted', 'dismissed'],
      accepted: ['completed', 'dismissed'],
      dismissed: [],
      completed: [],
    };
    if (!transitions[recommendation.status].includes(status)) {
      return res.status(409).json({ success: false, message: `Cannot change recommendation from ${recommendation.status} to ${status}` });
    }

    recommendation.status = status;
    await recommendation.save();
    return res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    return next(error);
  }
};

const buildAssistantReply = ({ message, user, activity, recommendedReward }) => {
  const normalized = message.toLowerCase();
  if (/\b(pain|injury|illness|disease|medicine|medication|diagnos|treatment)\b/.test(normalized)) {
    return 'I cannot diagnose symptoms or advise on medicine or treatment. If you have a health concern, please speak with a qualified healthcare professional. I can still help explain your recorded activity or reward balance.';
  }
  if (normalized.includes('calorie')) {
    return 'Calories are not measured in this app. The analytics page shows a rough estimate derived from your logged steps using the displayed assumptions; actual energy use varies. You can rely on the recorded step count as the measured value.';
  }
  if (normalized.includes('reward') || normalized.includes('redeem')) {
    if (recommendedReward) {
      if (recommendedReward.pointsRequired <= user.availablePoints) {
        return `Your available reward balance is ${formatRupees(user.availablePoints)}. You can redeem ${recommendedReward.title}, which costs ${formatRupees(recommendedReward.pointsRequired)}. I can point you to the catalog, but I will not redeem anything for you.`;
      }
      return `Your available reward balance is ${formatRupees(user.availablePoints)}. ${recommendedReward.title} requires ${formatRupees(recommendedReward.pointsRequired)}. I can point you to the catalog, but I will not redeem anything for you.`;
    }
    return `Your current available reward balance is ${formatRupees(user.availablePoints)}. There are no active rewards in the catalog right now.`;
  }
  if (normalized.includes('goal') || normalized.includes('target')) {
    if (user.dailyStepGoal) {
      return `Your current personal target is ${user.dailyStepGoal.toLocaleString()} steps per day. ${activity.loggedDays ? `You recorded ${activity.totalSteps.toLocaleString()} steps across ${activity.loggedDays} of the last 7 days.` : 'There are no step records from the last 7 days to compare with it.'} Any change is yours to make in profile settings.`;
    }
    return activity.averageStepsPerLoggedDay
      ? `Your recent average is ${activity.averageStepsPerLoggedDay.toLocaleString()} steps on days with a record. The recommendations panel can suggest a personal starting target; it will not be applied unless you confirm it.`
      : 'I do not have recent step records to base a personal target on yet. Log activity first, then review a suggested target; nothing will be changed automatically.';
  }
  if (normalized.includes('plan') || normalized.includes('week') || normalized.includes('challenge')) {
    return activity.loggedDays
      ? `For a flexible week, you could choose a few days that suit your schedule and compare your total with the ${activity.totalSteps.toLocaleString()} steps recorded across ${activity.loggedDays} days recently. This is an optional planning idea, not a calendar change or health prescription.`
      : 'I do not have recent activity records for a personalized weekly plan yet. A plan will not be created from made-up activity data.';
  }
  return activity.loggedDays
    ? `From your recent records, you logged ${activity.totalSteps.toLocaleString()} steps on ${activity.loggedDays} of the last 7 calendar days. I can explain your charts, review your goal, help plan a flexible week, or look at rewards.`
    : 'I do not have recent step records to summarize yet. You can ask me about chart estimates, your goal, weekly planning, or rewards after activity is logged.';
};

const getChatHistory = async (req, res, next) => {
  try {
    const conversation = await AIConversation.findOne({ userId: req.user.id }).select('messages updatedAt').lean();
    return res.status(200).json({
      success: true,
      data: conversation ? conversation.messages.slice(-30) : [],
    });
  } catch (error) {
    return next(error);
  }
};

const sendChatMessage = async (req, res, next) => {
  try {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ success: false, message: `message must contain 1 to ${MAX_MESSAGE_LENGTH} characters` });
    }

    const [user, activity, rewards] = await Promise.all([
      User.findById(req.user.id).select('dailyStepGoal availablePoints'),
      getUserActivity(req.user.id),
      Reward.find({ isActive: true }).select('title pointsRequired').sort({ pointsRequired: 1 }).lean(),
    ]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const recommendedReward = rewards.filter((reward) => reward.pointsRequired <= user.availablePoints).pop()
      || rewards.find((reward) => reward.pointsRequired > user.availablePoints);
    const assistantText = buildAssistantReply({ message, user, activity, recommendedReward });
    const messages = [
      { role: 'user', content: message },
      { role: 'assistant', content: assistantText },
    ];
    const conversation = await AIConversation.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { messages: { $each: messages, $slice: -MAX_CHAT_HISTORY } } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select('messages');

    return res.status(200).json({
      success: true,
      data: {
        messages: conversation.messages.slice(-2),
        disclaimer: 'This assistant uses in-app activity records only. It does not diagnose, prescribe, redeem rewards, or change account settings.',
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getInsights,
  generateRecommendations,
  getRecommendations,
  getRecommendationHistory,
  updateRecommendationStatus,
  getChatHistory,
  sendChatMessage,
  buildAssistantReply,
  getUserActivity,
};
