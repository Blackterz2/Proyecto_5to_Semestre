const http = require('http');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function main() {
  // 1. Crear usuario de prueba
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'fitness_app',
    connectionLimit: 1
  });

  const hash = await bcrypt.hash('test123', 10);
  await pool.execute(
    'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)',
    ['Test Hito4', 'testhito4@test.com', hash]
  );
  console.log('✅ Usuario creado');
  const [users] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', ['testhito4@test.com']);
  const userId = users[0].id;
  console.log('   ID:', userId);

  // 2. Login
  const loginRes = await apiPost('/api/auth/login', { email: 'testhito4@test.com', password: 'test123' });
  const token = loginRes.data?.token || loginRes.token;
  console.log('✅ Login OK');
  console.log('   Token:', token?.substring(0, 30) + '...');

  // 3. Crear una sesión de prueba (POST /api/sesiones)
  const sesionBody = {
    rutina_id: 1,
    fecha: '2026-06-15',
    ejercicios: [{
      ejercicio_id: 1,
      series: [
        { numero_serie: 1, peso: 50, repeticiones: 10, completada: true },
        { numero_serie: 2, peso: 55, repeticiones: 8, completada: true }
      ]
    }]
  };
  const sesionRes = await apiPost('/api/sesiones', sesionBody, token);
  console.log('✅ Sesión creada:', JSON.stringify(sesionRes));

  // 4. Verificar en BD que las series tienen completada=1
  const [series] = await pool.execute(`
    SELECT ss.id, ss.peso, ss.repeticiones, ss.completada 
    FROM sesion_series ss 
    JOIN sesion_ejercicios sej ON sej.id = ss.sesion_ejercicio_id 
    JOIN sesiones_entrenamiento s ON s.id = sej.sesion_id 
    WHERE s.usuario_id = ? 
    ORDER BY ss.id DESC LIMIT 4
  `, [userId]);
  console.log('✅ Series guardadas con completada:');
  console.table(series.map(s => ({ id: s.id, peso: s.peso, reps: s.repeticiones, completada: s.completada })));

  // 5. Obtener historial con volumen y series
  const historial = await apiGet('/api/sesiones', token);
  console.log('✅ Historial con Volumen:');
  historial.forEach(s => {
    console.log(`   ID: ${s.id} | Fecha: ${s.fecha} | Vol: ${s.volumen_total_kg} kg | Series: ${s.total_series}`);
  });

  await pool.end();
  console.log('\n🎉 TODO OK');
}

function apiPost(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request('http://localhost:3000' + path, { method: 'POST', headers }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        const r = JSON.parse(b);
        if (r.status === 'error') reject(new Error(r.message));
        else resolve(r);
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function apiGet(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request('http://localhost:3000' + path, { method: 'GET', headers }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        const r = JSON.parse(b);
        if (r.status === 'error') reject(new Error(r.message));
        else resolve(r.data || r);
      });
    });
    req.on('error', reject);
    req.end();
  });
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
