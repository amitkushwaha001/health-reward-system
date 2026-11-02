const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const Step = require('../models/Step');
const Redemption = require('../models/Redemption');
const { DEFAULT_REWARDS, ensureDefaultRewards } = require('../utils/ensureDefaultRewards');
const { migratePointsToPaise } = require('../utils/migratePointsToPaise');
const { calculatePoints, formatRupees } = require('../utils/helpers');
const Reward = require('../models/Reward');
const User = require('../models/User');
process.env.LOGIN_RATE_LIMIT = '2';
const app = require('../app');

let mongo;

const register = async (name, email) => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'strong-test-password', confirmPassword: 'strong-test-password' });
  assert.equal(response.status, 201);
  return response.body;
};

before(async () => {
  process.env.JWT_SECRET = 'test-only-secret-that-is-never-used-outside-tests';
  process.env.JWT_EXPIRE = '1h';
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})));
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('preserves authenticated registration, profile, and step API contracts', async () => {
  const { token, user } = await register('Test User', 'test@example.com');
  assert.ok(token);
  assert.equal(user.email, 'test@example.com');

  const unauthenticated = await request(app).get('/api/auth/profile');
  assert.equal(unauthenticated.status, 401);

  const profile = await request(app)
    .get('/api/auth/profile')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(profile.status, 200);
  assert.equal(profile.body.data.email, 'test@example.com');

  const step = await request(app)
    .post('/api/steps/add')
    .set('Authorization', `Bearer ${token}`)
    .send({ date: '2026-10-15', steps: 1250 });
  assert.equal(step.status, 201);
  assert.equal(step.body.data.steps, 1250);
  assert.equal(step.body.data.pointsEarned, 12500);
  assert.equal(step.body.message, '1250 steps recorded! You earned ₹125.00.');

  const updatedProfile = await request(app)
    .get('/api/auth/profile')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(updatedProfile.body.data.totalSteps, 1250);
  assert.equal(updatedProfile.body.data.totalPoints, 12500);
});

test('does not allow a user to edit another user step record', async () => {
  const owner = await register('Owner', 'owner@example.com');
  const other = await register('Other User', 'other@example.com');

  const step = await request(app)
    .post('/api/steps/add')
    .set('Authorization', `Bearer ${owner.token}`)
    .send({ date: '2026-10-16', steps: 2000 });

  const attempt = await request(app)
    .put(`/api/steps/update/${step.body.data._id}`)
    .set('Authorization', `Bearer ${other.token}`)
    .send({ steps: 9000 });

  assert.equal(attempt.status, 403);
});

test('keeps daily step and points totals correct when replacing an entry', async () => {
  const { token } = await register('Step Editor', 'step-editor@example.com');
  const headers = { Authorization: `Bearer ${token}` };
  await request(app).post('/api/steps/add').set(headers).send({ date: '2026-10-17', steps: 1250 }).expect(201);
  await request(app).post('/api/steps/add').set(headers).send({ date: '2026-10-17', steps: 2500 }).expect(201);

  const profile = await request(app).get('/api/auth/profile').set(headers).expect(200);
  assert.equal(profile.body.data.totalSteps, 2500);
  assert.equal(profile.body.data.totalPoints, 25000);
  assert.equal(profile.body.data.availablePoints, 25000);
});

test('validates step counts and date filters', async () => {
  const { token } = await register('Validator', 'validator@example.com');
  const headers = { Authorization: `Bearer ${token}` };

  await request(app).post('/api/steps/add').set(headers).send({ date: '2026-02-30', steps: 100 }).expect(400);
  await request(app).post('/api/steps/add').set(headers).send({ date: '2026-10-18', steps: -1 }).expect(400);
  await request(app).get('/api/steps/history?startDate=not-a-date').set(headers).expect(400);
});

test('serializes competing redemptions without overdrawing the reward balance', async () => {
  const { token } = await register('Reward User', 'reward-user@example.com');
  const headers = { Authorization: `Bearer ${token}` };
  await request(app).post('/api/steps/add').set(headers).send({ date: '2026-10-19', steps: 2000 }).expect(201);
  const reward = await Reward.create({
    title: 'Test voucher',
    category: 'CASH',
    pointsRequired: 15000,
    value: 1,
  });

  const responses = await Promise.all([
    request(app).post('/api/rewards/redeem').set(headers).send({ rewardId: reward._id.toString() }),
    request(app).post('/api/rewards/redeem').set(headers).send({ rewardId: reward._id.toString() }),
  ]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [201, 400]);

  const profile = await request(app).get('/api/auth/profile').set(headers).expect(200);
  assert.equal(profile.body.data.availablePoints, 5000);
  assert.equal(profile.body.data.redeemedPoints, 15000);
});

test('limits repeated login attempts', async () => {
  await register('Rate Limited', 'rate-limited@example.com');
  const attempts = await Promise.all([
    request(app).post('/api/auth/login').send({ email: 'rate-limited@example.com', password: 'wrong-password' }),
    request(app).post('/api/auth/login').send({ email: 'rate-limited@example.com', password: 'wrong-password' }),
    request(app).post('/api/auth/login').send({ email: 'rate-limited@example.com', password: 'wrong-password' }),
  ]);
  assert.deepEqual(attempts.map((response) => response.status).sort(), [401, 401, 429]);
});

test('returns user-scoped real analytics and labels step-derived estimates', async () => {
  const firstUser = await register('Analytics One', 'analytics-one@example.com');
  const secondUser = await register('Analytics Two', 'analytics-two@example.com');

  await request(app)
    .post('/api/steps/add')
    .set('Authorization', `Bearer ${firstUser.token}`)
    .send({ date: '2026-10-20', steps: 2200 })
    .expect(201);
  await request(app)
    .post('/api/steps/add')
    .set('Authorization', `Bearer ${firstUser.token}`)
    .send({ date: '2026-10-22', steps: 1000 })
    .expect(201);
  await request(app)
    .post('/api/steps/add')
    .set('Authorization', `Bearer ${secondUser.token}`)
    .send({ date: '2026-10-20', steps: 9000 })
    .expect(201);

  const analytics = await request(app)
    .get('/api/analytics/activity?range=daily&startDate=2026-10-20&endDate=2026-10-22')
    .set('Authorization', `Bearer ${firstUser.token}`)
    .expect(200);
  assert.equal(analytics.body.data.totals.totalSteps, 3200);
  assert.equal(analytics.body.data.totals.totalPointsEarned, 32000);
  assert.equal(analytics.body.data.buckets.length, 3);
  assert.equal(analytics.body.data.buckets[1].steps, null);
  assert.equal(analytics.body.data.estimates.isEstimate, true);
  assert.equal(analytics.body.data.estimates.caloriesBurned, 128);
  assert.equal(analytics.body.data.estimates.activityMinutes, 32);
});

test('rejects invalid analytics ranges and requires authentication', async () => {
  await request(app).get('/api/analytics/activity').expect(401);
  const { token } = await register('Range User', 'range-user@example.com');
  const headers = { Authorization: `Bearer ${token}` };

  await request(app).get('/api/analytics/activity?range=year').set(headers).expect(400);
  await request(app)
    .get('/api/analytics/activity?range=daily&startDate=2020-01-01&endDate=2026-10-22')
    .set(headers)
    .expect(400);
});

const recentDate = (daysAgo) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

test('generates personalized recommendations and enforces the recommendation lifecycle per user', async () => {
  const owner = await register('Recommendation Owner', 'recommendation-owner@example.com');
  const other = await register('Recommendation Other', 'recommendation-other@example.com');
  const ownerHeaders = { Authorization: `Bearer ${owner.token}` };
  const otherHeaders = { Authorization: `Bearer ${other.token}` };

  for (const daysAgo of [1, 2, 3, 4]) {
    await request(app)
      .post('/api/steps/add')
      .set(ownerHeaders)
      .send({ date: recentDate(daysAgo), steps: 2000 })
      .expect(201);
  }
  await Reward.create({ title: 'Nearby voucher', category: 'CASH', pointsRequired: 50, value: 5 });

  const generated = await request(app)
    .post('/api/ai/recommendations/generate')
    .set(ownerHeaders)
    .expect(200);
  assert.ok(generated.body.data.length >= 2);
  const goal = generated.body.data.find((item) => item.targetStepGoal);
  const rewardRecommendation = generated.body.data.find((item) => item.key.startsWith('reward-'));
  assert.ok(rewardRecommendation);
  assert.equal(rewardRecommendation.title, 'A reward is within your current balance');
  assert.ok(goal);
  assert.match(goal.explanation, /2,000 steps/i);
  assert.equal(goal.status, 'pending');

  const accepted = await request(app)
    .patch(`/api/ai/recommendations/${goal._id}/status`)
    .set(ownerHeaders)
    .send({ status: 'accepted' })
    .expect(200);
  assert.equal(accepted.body.data.status, 'accepted');

  await request(app)
    .patch(`/api/ai/recommendations/${goal._id}/status`)
    .set(ownerHeaders)
    .send({ status: 'completed' })
    .expect(200);
  await request(app)
    .patch(`/api/ai/recommendations/${goal._id}/status`)
    .set(ownerHeaders)
    .send({ status: 'dismissed' })
    .expect(409);

  const otherHistory = await request(app)
    .get('/api/ai/recommendations/history')
    .set(otherHeaders)
    .expect(200);
  assert.equal(otherHistory.body.count, 0);

  const crossUserUpdate = await request(app)
    .patch(`/api/ai/recommendations/${goal._id}/status`)
    .set(otherHeaders)
    .send({ status: 'accepted' })
    .expect(404);
  assert.equal(crossUserUpdate.body.success, false);
});

test('keeps assistant history private and provides context-aware, responsible replies', async () => {
  const owner = await register('Assistant Owner', 'assistant-owner@example.com');
  const other = await register('Assistant Other', 'assistant-other@example.com');
  const ownerHeaders = { Authorization: `Bearer ${owner.token}` };
  const otherHeaders = { Authorization: `Bearer ${other.token}` };

  await request(app)
    .post('/api/steps/add')
    .set(ownerHeaders)
    .send({ date: recentDate(0), steps: 4500 })
    .expect(201);
  await Reward.create({
    title: 'Affordable shopping voucher',
    category: 'SHOPPING_VOUCHER',
    pointsRequired: 20000,
    value: 20,
  });
  await Reward.create({
    title: 'Future travel voucher',
    category: 'TRAVEL_VOUCHER',
    pointsRequired: 100000,
    value: 100,
  });
  const chat = await request(app)
    .post('/api/ai/chat')
    .set(ownerHeaders)
    .send({ message: 'Can I redeem a reward?' })
    .expect(200);
  assert.match(chat.body.data.messages[1].content, /can redeem Affordable shopping voucher/i);
  assert.match(chat.body.data.messages[1].content, /₹200\.00/);
  assert.match(chat.body.data.disclaimer, /does not .* change account settings/i);

  const medicalQuestion = await request(app)
    .post('/api/ai/chat')
    .set(ownerHeaders)
    .send({ message: 'What medicine should I take for pain?' })
    .expect(200);
  assert.match(medicalQuestion.body.data.messages[1].content, /cannot diagnose/i);

  const ownerHistory = await request(app).get('/api/ai/chat/history').set(ownerHeaders).expect(200);
  const otherHistory = await request(app).get('/api/ai/chat/history').set(otherHeaders).expect(200);
  assert.equal(ownerHistory.body.data.length, 4);
  assert.equal(otherHistory.body.data.length, 0);
});

test('refuses malformed profile goal settings', async () => {
  const { token } = await register('AI Goal User', 'ai-goal@example.com');
  const headers = { Authorization: `Bearer ${token}` };
  await request(app).put('/api/user/profile').set(headers).send({ dailyStepGoal: 10.5 }).expect(400);
  await request(app).put('/api/user/profile').set(headers).send({ email: {} }).expect(400);
  await request(app).put('/api/user/profile').set(headers).send(null).expect(400);
  const updated = await request(app)
    .put('/api/user/profile')
    .set(headers)
    .send({ dailyStepGoal: 5000, preferredWalkingTime: 'evening' })
    .expect(200);
  assert.equal(updated.body.data.dailyStepGoal, 5000);
  assert.equal(updated.body.data.preferredWalkingTime, 'evening');
});

test('protects admin routes while allowing admins to manage rewards', async () => {
  const regularUser = await register('Regular User', 'regular-user@example.com');
  await request(app)
    .get('/api/admin/rewards')
    .set({ Authorization: `Bearer ${regularUser.token}` })
    .expect(403);

  const admin = await register('Test Admin', 'test-admin@example.com');
  await User.updateOne({ email: admin.user.email }, { role: 'admin' });
  const headers = { Authorization: `Bearer ${admin.token}` };
  await request(app).get('/api/admin/rewards').set(headers).expect(200).expect((response) => {
    assert.equal(response.body.count, 0);
  });
  await request(app)
    .post('/api/admin/rewards')
    .set(headers)
    .send({ title: 'Admin voucher', category: 'SHOPPING_VOUCHER', pointsRequired: 25, value: 10 })
    .expect(201);
  const rewards = await request(app).get('/api/admin/rewards').set(headers).expect(200);
  assert.equal(rewards.body.count, 1);
  assert.equal(rewards.body.data[0].title, 'Admin voucher');
});

test('bootstraps a starter reward catalog once without overriding admin changes', async () => {
  await ensureDefaultRewards();
  assert.equal(await Reward.countDocuments(), DEFAULT_REWARDS.length);

  const shoppingVoucher = await Reward.findOne({ catalogKey: 'starter-shopping-50' });
  shoppingVoucher.isActive = false;
  await shoppingVoucher.save();
  await Reward.deleteOne({ catalogKey: 'starter-travel-50' });

  await ensureDefaultRewards();

  assert.equal(await Reward.countDocuments(), DEFAULT_REWARDS.length - 1);
  assert.equal((await Reward.findOne({ catalogKey: 'starter-shopping-50' })).isActive, false);
  assert.equal(await Reward.exists({ catalogKey: 'starter-travel-50' }), null);
});

test('lists starter travel and shopping rewards and redeems one using earned points', async () => {
  await ensureDefaultRewards();
  const { token } = await register('Catalog User', 'catalog-user@example.com');
  const headers = { Authorization: `Bearer ${token}` };

  await request(app)
    .post('/api/steps/add')
    .set(headers)
    .send({ date: recentDate(0), steps: 50000 })
    .expect(201);

  const catalog = await request(app).get('/api/rewards').set(headers).expect(200);
  assert.ok(catalog.body.data.some((reward) => reward.category === 'SHOPPING_VOUCHER'));
  const travelReward = catalog.body.data.find((reward) => reward.category === 'TRAVEL_VOUCHER');
  assert.ok(travelReward);

  await request(app)
    .post('/api/rewards/redeem')
    .set(headers)
    .send({ rewardId: travelReward._id })
    .expect(201);

  const profile = await request(app).get('/api/auth/profile').set(headers).expect(200);
  assert.equal(profile.body.data.availablePoints, 495000);
  assert.equal(profile.body.data.redeemedPoints, 5000);

  const history = await request(app).get('/api/rewards/history').set(headers).expect(200);
  assert.equal(history.body.data[0].rewardId.category, 'TRAVEL_VOUCHER');
  assert.equal(history.body.data[0].rewardId.currency, '₹');
});

test('earns exactly 10 paise for each logged step', () => {
  assert.equal(calculatePoints(1), 10);
  assert.equal(calculatePoints(100), 1000);
  assert.equal(calculatePoints(1000), 10000);
  assert.equal(formatRupees(calculatePoints(1)), '₹0.10');
  assert.equal(formatRupees(calculatePoints(100)), '₹10.00');
});

test('migrates legacy point values to paise once without changing their rupee value', async () => {
  const user = await User.create({
    name: 'Legacy Balance',
    email: 'legacy-balance@example.com',
    password: 'strong-test-password',
    totalPoints: 150,
    availablePoints: 100,
    redeemedPoints: 50,
    pointsUnitVersion: 1,
  });
  const step = await Step.create({
    userId: user._id,
    date: new Date('2026-10-25'),
    steps: 10000,
    pointsEarned: 100,
    pointsUnitVersion: 1,
  });
  const reward = await Reward.create({
    title: 'Legacy reward',
    category: 'CASH',
    pointsRequired: 100,
    value: 10,
    pointsUnitVersion: 1,
  });
  const redemption = await Redemption.create({
    userId: user._id,
    rewardId: reward._id,
    pointsUsed: 100,
    redemptionType: 'CASH',
    value: 10,
    redeemCode: 'LEGACY01',
    pointsUnitVersion: 1,
  });

  await migratePointsToPaise();
  await migratePointsToPaise();

  const migratedUser = await User.findById(user._id);
  const migratedStep = await Step.findById(step._id);
  const migratedReward = await Reward.findById(reward._id);
  const migratedRedemption = await Redemption.findById(redemption._id);

  assert.equal(migratedUser.totalPoints, 1500);
  assert.equal(migratedUser.availablePoints, 1000);
  assert.equal(migratedUser.redeemedPoints, 500);
  assert.equal(migratedStep.pointsEarned, 1000);
  assert.equal(migratedReward.pointsRequired, 1000);
  assert.equal(migratedRedemption.pointsUsed, 1000);
});
