const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/server');

test('GET /api/rutinas — sin token devuelve 401', async () => {
  const res = await request(app).get('/api/rutinas');
  assert.strictEqual(res.status, 401);
});

test('GET /api/rutinas — con token inválido devuelve 401', async () => {
  const res = await request(app)
    .get('/api/rutinas')
    .set('Authorization', 'Bearer token_invalido_falso');

  assert.strictEqual(res.status, 401);
});

test('POST /api/rutinas/crear — sin token devuelve 401', async () => {
  const res = await request(app)
    .post('/api/rutinas/crear')
    .send({ nombre: 'Rutina de prueba' });

  assert.strictEqual(res.status, 401);
});
