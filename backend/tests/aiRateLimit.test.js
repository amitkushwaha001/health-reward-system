const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

process.env.AI_RATE_LIMIT = '1';
process.env.JWT_SECRET = 'test-only-secret-that-is-never-used-outside-tests';
process.env.JWT_EXPIRE = '1h';
const app = require('../app');

let mongo;

before(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('limits repeated authenticated assistant requests', async () => {
  const registration = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'AI Rate User',
      email: 'ai-rate@example.com',
      password: 'strong-test-password',
      confirmPassword: 'strong-test-password',
    })
    .expect(201);
  const headers = { Authorization: `Bearer ${registration.body.token}` };

  await request(app).post('/api/ai/chat').set(headers).send({ message: 'Hello' }).expect(200);
  const limited = await request(app).post('/api/ai/chat').set(headers).send({ message: 'Hello again' });
  assert.equal(limited.status, 429);
});
