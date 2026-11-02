const { formatRupees } = require('./helpers');

const getDayKey = (date) => date.toISOString().slice(0, 10);

const generateRecommendationDrafts = ({ user, steps, rewards, now = new Date() }) => {
  const recentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6));
  const recentSteps = steps.filter((step) => step.date >= recentStart && step.date <= now);
  const loggedDays = new Set(recentSteps.map((step) => getDayKey(step.date))).size;
  const recentTotal = recentSteps.reduce((sum, step) => sum + step.steps, 0);
  const average = loggedDays ? Math.round(recentTotal / loggedDays) : null;
  const drafts = [];

  if (!recentSteps.length) {
    drafts.push({
      key: 'activity-baseline',
      title: 'Start with one activity entry',
      explanation: 'There are no recent step records yet, so a personal trend or target cannot be calculated from your account data.',
      expectedBenefit: 'A first entry gives future insights a real starting point.',
      priority: 'medium',
      suggestedAction: 'Log a step count on a day you choose; no goal will be set automatically.',
    });
  } else if (!user.dailyStepGoal) {
    const target = Math.max(1, Math.ceil((average * 1.1) / 100) * 100);
    drafts.push({
      key: `personal-goal-${target}`,
      title: `Consider a personal target near ${target.toLocaleString()} steps`,
      explanation: `Your recent logged-day average is ${average.toLocaleString()} steps. This optional suggestion is based only on your recorded activity.`,
      expectedBenefit: 'A user-chosen target can make your own progress easier to review.',
      priority: 'medium',
      suggestedAction: 'Review this suggestion and set it only if it feels right for you.',
      targetStepGoal: target,
    });
  } else {
    const goalDays = recentSteps.filter((step) => step.steps >= user.dailyStepGoal).length;
    drafts.push({
      key: `goal-review-${user.dailyStepGoal}-${goalDays}`,
      title: `Review your ${user.dailyStepGoal.toLocaleString()}-step personal goal`,
      explanation: `You logged activity on ${loggedDays} of the last 7 calendar days and met your current target on ${goalDays} recorded day${goalDays === 1 ? '' : 's'}. Unlogged days are not treated as zero.`,
      expectedBenefit: 'A regular review helps keep a user-selected target relevant to your routine.',
      priority: 'low',
      suggestedAction: 'Keep, change, or clear this goal from your profile settings.',
    });
  }

  if (loggedDays > 0 && loggedDays < 4) {
    const preferredTime = user.preferredWalkingTime && user.preferredWalkingTime !== 'flexible'
      ? user.preferredWalkingTime
      : 'a time that suits you';
    drafts.push({
      key: `consistency-${loggedDays}-${preferredTime.replaceAll(' ', '-')}`,
      title: 'Make step logging fit your routine',
      explanation: `You have ${loggedDays} logged day${loggedDays === 1 ? '' : 's'} in the last 7 calendar days. This reflects records, not untracked activity.`,
      expectedBenefit: 'More consistent records make personal trend summaries more useful.',
      priority: 'low',
      suggestedAction: `If useful, choose ${preferredTime} for a walk or for recording your steps.`,
    });
  }

  if (loggedDays >= 4) {
    const target = Math.max(1, Math.ceil((recentTotal * 1.05) / 100) * 100);
    drafts.push({
      key: `weekly-challenge-${target}`,
      title: `Try a personal weekly challenge of ${target.toLocaleString()} steps`,
      explanation: `Your last 7 calendar days contain ${recentTotal.toLocaleString()} logged steps across ${loggedDays} recorded days. The challenge is an optional comparison, not a health prescription.`,
      expectedBenefit: 'A weekly total gives you a flexible way to compare your own activity.',
      priority: 'low',
      suggestedAction: 'Accept the challenge if it fits your plans; activity and goals remain under your control.',
    });
  }

  const availableRewards = rewards
    .filter((reward) => reward.isActive)
    .sort((left, right) => left.pointsRequired - right.pointsRequired);
  const nextReward = availableRewards.filter((reward) => reward.pointsRequired <= user.availablePoints).pop()
    || availableRewards.find((reward) => reward.pointsRequired > user.availablePoints);
  if (nextReward) {
    const pointsNeeded = Math.max(0, nextReward.pointsRequired - user.availablePoints);
    drafts.push({
      key: `reward-${nextReward._id}-${pointsNeeded}`,
      title: pointsNeeded ? `${formatRupees(pointsNeeded)} to your next reward` : 'A reward is within your current balance',
      explanation: `${nextReward.title} requires ${formatRupees(nextReward.pointsRequired)}; your available reward balance is ${formatRupees(user.availablePoints)}.`,
      expectedBenefit: 'Shows a real catalog option alongside your current reward balance.',
      priority: pointsNeeded === 0 ? 'medium' : 'low',
      suggestedAction: pointsNeeded ? 'Review the reward in the catalog; each new step earns ₹0.10.' : 'Review this reward in the catalog; it will not be redeemed automatically.',
    });
  }

  return drafts;
};

module.exports = { generateRecommendationDrafts };
