// ============================================================
// CONFIGURACIÓN DE LA BASE DE DATOS - Pool de conexiones MySQL
// ============================================================
// Este archivo crea y exporta un "pool" de conexiones hacia
// MySQL. Un pool mantiene varias conexiones abiertas y las
// reutiliza, evitando tener que abrir/cerrar una conexión
// en cada request.
//
// ¿Por qué un POOL y no una sola conexión?
// ----------------------------------------
// - Una sola conexión procesa 1 request por vez. Si llegan
//   20 requests simultáneas, 19 esperan en fila.
// - Un pool mantiene N conexiones abiertas (acá: hasta 10).
//   Reparte las requests entre ellas. Mucho más rápido.
// - Si una conexión se cae, el pool la descarta y crea una
//   nueva automáticamente.

// mysql2/promise: la versión con soporte nativo de Promises
// (async/await). La versión común usa callbacks.
const mysql = require('mysql2/promise');

// ============================================================
// CREACIÓN DEL POOL
// ============================================================
// createPool() configura el grupo de conexiones.
// Los valores se leen de las variables de entorno (process.env)
// que se cargan desde el archivo .env.
//
// El operador || asigna un valor por defecto si la variable
// de entorno no está definida. Así el sistema no explota si
// olvidaste configurar algo.
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'blackterz',

  // ============================================================
  // OPCIONES DEL POOL
  // ============================================================
  // waitForConnections: true
  //   Si todas las conexiones están ocupadas, esperá a que
  //   una se libere en vez de tirar error directamente.
  waitForConnections: true,

  // connectionLimit: 10
  //   Máximo de conexiones abiertas simultáneamente.
  //   MySQL por defecto acepta 151 conexiones, así que
  //   10 está sobrado para desarrollo.
  connectionLimit: 10,

  // queueLimit: 0
  //   Máximo de requests en cola de espera.
  //   0 = cola infinita (nunca rechazamos una request).
  queueLimit: 0,
});

// Exportamos el pool para que otros módulos lo usen.
// Cada método del pool devuelve una Promise (gracias a /promise):
//   pool.execute('SQL')   → para queries parametrizadas
//   pool.query('SQL')     → para queries simples
//   pool.getConnection()  → para manejo manual de transacciones
module.exports = pool;
