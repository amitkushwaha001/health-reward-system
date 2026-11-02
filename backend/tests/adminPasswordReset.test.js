const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const { resetAdminAccount, TARGET_EMAIL } = require('../scripts/resetAdminPassword');

let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  await User.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('resets only the existing target account and promotes it to admin', async () => {
  await User.create([
    { name: 'Target account', email: TARGET_EMAIL, password: 'old-password', role: 'user' },
    { name: 'Unrelated account', email: 'unrelated@example.com', password: 'untouched-password', role: 'user' },
  ]);

  await resetAdminAccount('new-test-password-with-12');

  const target = await User.findOne({ email: TARGET_EMAIL }).select('+password');
  const unrelated = await User.findOne({ email: 'unrelated@example.com' }).select('+password');

  assert.equal(target.role, 'admin');
  assert.equal(await target.matchPassword('new-test-password-with-12'), true);
  assert.equal(await target.matchPassword('old-password'), false);
  assert.equal(unrelated.role, 'user');
  assert.equal(await unrelated.matchPassword('untouched-password'), true);
  assert.equal(await User.countDocuments(), 2);
});

test('does not create an account when the target email does not exist', async () => {
  await assert.rejects(
    resetAdminAccount('new-test-password-with-12'),
    /No existing account matches/
  );
  assert.equal(await User.countDocuments(), 0);
});

test('rejects passwords shorter than the minimum length', async () => {
  await assert.rejects(resetAdminAccount('short'), /at least 12 characters/);
  assert.equal(await User.countDocuments(), 0);
});

test('rejects reusing the existing password', async () => {
  await User.create({
    name: 'Target account',
    email: TARGET_EMAIL,
    password: 'existing-test-password',
    role: 'user',
  });

  await assert.rejects(
    resetAdminAccount('existing-test-password'),
    /differ from the current password/
  );
  const target = await User.findOne({ email: TARGET_EMAIL });
  assert.equal(target.role, 'user');
});
