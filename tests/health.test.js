const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/server');

test('GET /api/health — responde 200', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
});
