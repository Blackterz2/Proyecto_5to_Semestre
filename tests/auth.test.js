const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/server');

test('POST /api/auth/login — credenciales inválidas devuelve 401', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'no-existe@test.com', password: 'claveincorrecta123' });

  assert.strictEqual(res.status, 401);
});

test('POST /api/auth/login — sin email ni password devuelve 400', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({});

  assert.strictEqual(res.status, 400);
});

test('POST /api/auth/register — email con formato inválido devuelve 400', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ nombre: 'Test', email: 'no-es-un-email', password: 'claveSegura123' });

  assert.strictEqual(res.status, 400);
});
