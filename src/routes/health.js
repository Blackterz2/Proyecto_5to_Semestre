// ============================================================
// RUTA DE HEALTHCHECK - Verifica que el servidor y la DB
//                       estén funcionando
// ============================================================
// Este endpoint es como el "chequeo médico" de nuestra app.
// Cuando alguien hace GET /api/health, el servidor:
//   1. Intenta ejecutar SELECT 1 en la base de datos
//   2. Si funciona → responde con {"status": "ok", "db": "conectada"}
//   3. Si falla   → responde con error 500
//
// Es útil para:
//   - Saber si el servidor está vivo
//   - Saber si la base de datos responde
//   - Que servicios de monitoreo (como UptimeRobot) verifiquen
//     que todo funciona

const { Router } = require('express');

// Importamos el pool de conexiones creado en db.js
// Así este módulo puede ejecutar queries a MySQL
const pool = require('../config/db');

// Router() nos da un "mini Express" para definir rutas.
// Después lo montamos en server.js con app.use('/api/health', ...)
const router = Router();

// ============================================================
// GET /api/health
// ============================================================
// async: porque vamos a esperar (await) la respuesta de la DB
// req: la petición del cliente (no la usamos acá)
// res: la respuesta que vamos a devolver
// next: función para pasar el control al middleware de errores
router.get('/', async (req, res, next) => {
  try {
    // ============================================================
    // EJECUTAMOS SELECT 1 EN MYSQL
    // ============================================================
    // SELECT 1 es el "ping" estándar de MySQL. No necesita
    // ninguna tabla, solo verifica que el motor de DB responda.
    //
    // pool.execute() devuelve [rows, fields]:
    //   - rows:   los resultados de la query (array de objetos)
    //   - fields: metadatos de las columnas (casi no se usan)
    // Con destructuring [rows] nos quedamos solo con los datos.
    const [rows] = await pool.execute('SELECT 1 AS result');

    // Si llegamos acá, la DB respondió bien.
    // rows[0].result debería ser 1.
    res.json({
      status: 'ok',
      db: rows[0].result === 1 ? 'conectada' : 'error',
    });
  } catch (error) {
    // ============================================================
    // SI LA DB FALLA, PASAMOS EL ERROR AL MIDDLEWARE
    // ============================================================
    // next(error) le dice a Express: "che, ocurrió un error,
    // que lo maneje el middleware de errores".
    // Así centralizamos el formato de errores en server.js.
    next(error);
  }
});

// Exportamos el router para que server.js lo monte
module.exports = router;
