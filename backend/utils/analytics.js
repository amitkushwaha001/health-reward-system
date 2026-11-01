const ESTIMATES = Object.freeze({
  caloriesPerStep: 0.04,
  stepsPerMinute: 100,
});

const utcDay = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const dateKey = (date, range) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  if (range === 'monthly') return `${year}-${month}`;
  if (range === 'weekly') return `${year}-${month}-${day}`;
  return `${year}-${month}-${day}`;
};

const bucketStart = (date, range) => {
  const day = utcDay(date);
  if (range === 'monthly') return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
  if (range === 'weekly') {
    day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  }
  return day;
};

const nextBucket = (date, range) => {
  const next = new Date(date);
  if (range === 'monthly') next.setUTCMonth(next.getUTCMonth() + 1);
  else if (range === 'weekly') next.setUTCDate(next.getUTCDate() + 7);
  else next.setUTCDate(next.getUTCDate() + 1);
  return next;
};

const makeBuckets = (range, startDate, endDate) => {
  const buckets = [];
  let date = bucketStart(startDate, range);
  const last = bucketStart(endDate, range);

  while (date <= last) {
    const key = dateKey(date, range);
    buckets.push({
      date: key,
      label: range === 'weekly' ? `Week of ${key}` : key,
      steps: null,
      pointsEarned: null,
      loggedDays: 0,
      redemptionCount: 0,
      pointsRedeemed: 0,
    });
    date = nextBucket(date, range);
  }

  return buckets;
};

const buildAnalytics = ({ range, startDate, endDate, stepRecords, redemptions, dailyStepGoal, heatmapRecords = stepRecords }) => {
  const buckets = makeBuckets(range, startDate, endDate);
  const byKey = new Map(buckets.map((bucket) => [bucket.date, bucket]));

  for (const step of stepRecords) {
    const key = dateKey(bucketStart(step.date, range), range);
    const bucket = byKey.get(key);
    if (!bucket) continue;
    if (bucket.steps === null) {
      bucket.steps = 0;
      bucket.pointsEarned = 0;
    }
    bucket.steps += step.steps;
    bucket.pointsEarned += step.pointsEarned;
    bucket.loggedDays += 1;
  }

  for (const redemption of redemptions) {
    const key = dateKey(bucketStart(redemption.createdAt, range), range);
    const bucket = byKey.get(key);
    if (!bucket) continue;
    bucket.redemptionCount += 1;
    bucket.pointsRedeemed += redemption.pointsUsed;
  }

  const loggedBuckets = buckets.filter((bucket) => bucket.loggedDays > 0);
  const totalSteps = loggedBuckets.reduce((sum, bucket) => sum + bucket.steps, 0);
  const totalPointsEarned = loggedBuckets.reduce((sum, bucket) => sum + bucket.pointsEarned, 0);
  const totalPointsRedeemed = buckets.reduce((sum, bucket) => sum + bucket.pointsRedeemed, 0);
  const totalRedemptions = buckets.reduce((sum, bucket) => sum + bucket.redemptionCount, 0);
  const goalCompletedDays = dailyStepGoal
    ? stepRecords.filter((step) => step.steps >= dailyStepGoal).length
    : null;
  const heatmapMonth = endDate.getUTCMonth();
  const heatmapYear = endDate.getUTCFullYear();
  const daysInMonth = new Date(Date.UTC(heatmapYear, heatmapMonth + 1, 0)).getUTCDate();
  const stepsByDay = new Map();
  for (const step of heatmapRecords) {
    if (step.date.getUTCFullYear() !== heatmapYear || step.date.getUTCMonth() !== heatmapMonth) continue;
    const day = step.date.getUTCDate();
    stepsByDay.set(day, (stepsByDay.get(day) || 0) + step.steps);
  }

  return {
    period: {
      range,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
    },
    buckets,
    totals: {
      totalSteps,
      totalPointsEarned,
      totalPointsRedeemed,
      totalRedemptions,
      loggedDays: stepRecords.length,
      averageStepsPerLoggedDay: stepRecords.length ? Math.round(totalSteps / stepRecords.length) : null,
    },
    goal: {
      dailyStepGoal: dailyStepGoal || null,
      completedDays: goalCompletedDays,
      trackedDays: dailyStepGoal ? stepRecords.length : null,
      completionRate: dailyStepGoal && stepRecords.length
        ? Math.round((goalCompletedDays / stepRecords.length) * 100)
        : null,
    },
    heatmap: {
      month: `${heatmapYear}-${String(heatmapMonth + 1).padStart(2, '0')}`,
      days: Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        return {
          day,
          weekday: new Date(Date.UTC(heatmapYear, heatmapMonth, day)).getUTCDay(),
          steps: stepsByDay.has(day) ? stepsByDay.get(day) : null,
        };
      }),
    },
    estimates: {
      isEstimate: true,
      caloriesBurned: stepRecords.length ? Math.round(totalSteps * ESTIMATES.caloriesPerStep) : null,
      activityMinutes: stepRecords.length ? Math.round(totalSteps / ESTIMATES.stepsPerMinute) : null,
      basis: 'Approximation from logged steps only: 0.04 kcal per step and 100 steps per minute; actual values vary by person and pace.',
      assumptions: ESTIMATES,
    },
  };
};

module.exports = { ESTIMATES, utcDay, makeBuckets, buildAnalytics };
