// ============================================================
// ENTRY POINT - Punto de entrada de la aplicación
// ============================================================
// Este archivo es el que se ejecuta con "node src/server.js"
// o con "npm start". Su trabajo es:
//   1. Cargar variables de entorno
//   2. Configurar Express (middlewares, rutas, errores)
//   3. Arrancar el servidor

// ============================================================
// 1. VARIABLES DE ENTORNO (dotenv)
// ============================================================
// dotenv.config() Lee el archivo .env de la raíz del proyecto
// y mete todas las variables en process.env.
//
// ⚠️ IMPORTANTE: Esta línea va ANTES de cualquier otro require
// que use process.env. Si db.js se ejecuta ANTES de que
// dotenv cargue las variables, DB_HOST va a ser undefined.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Importamos las rutas de healthcheck
const healthRouter = require('./routes/health');

// Importamos las rutas de rutinas (Hito 3 - Modelos, Controladores, Rutas)
const rutinaRouter = require('./routes/rutinaRoutes');

// Importamos las rutas de sesiones (Hito 4 - Transacciones SQL)
const sesionRouter = require('./routes/sesionRoutes');

// Importamos las rutas de autenticación (Hito 6 - JWT + bcrypt)
const authRouter = require('./routes/authRoutes');

// Importamos las rutas de ejercicios (Hito 11 Parte 3 - Catálogo de ejercicios)
const ejercicioRouter = require('./routes/ejercicioRoutes');

// Importamos las rutas de usuario (Hito 12.6 - Soft delete de cuenta)
const usuarioRouter = require('./routes/usuarioRoutes');

// ============================================================
// 2. CONFIGURACIÓN DE EXPRESS
// ============================================================
const app = express();

// el puerto se configura desde .env con fallback a 3000
const PORT = process.env.PORT || 3000;

// ============================================================
// 3. MIDDLEWARES GLOBALES
// ============================================================
// Los middlewares son funciones que se ejecutan en CADA request
// antes de llegar a las rutas. El orden IMPORTA.

// cors(): permite que otros dominios (como un frontend en React)
// hagan peticiones a esta API. Sin esto, el navegador bloquea
// las requests por política de seguridad CORS.
app.use(cors());

// express.json(): transforma automáticamente el body de las
// requests con Content-Type: application/json a un objeto
// JavaScript accesible desde req.body.
// Sin esto, req.body sería undefined.
app.use(express.json());

// express.static('public'): Sirve archivos ESTÁTICOS (HTML, CSS, JS,
// imágenes) desde la carpeta /public de forma automática.
//
// Cualquier archivo en /public se puede acceder directamente desde
// el navegador. Ej: /public/index.html → http://localhost:3000/
//                        /public/styles.css → http://localhost:3000/styles.css
//
// Sin esto, el navegador no podría cargar el CSS ni el JS del frontend.
app.use(express.static(path.join(__dirname, '..', 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.avif')) {
      res.setHeader('Content-Type', 'image/avif');
    }
  },
}));

// ============================================================
// 4. RUTAS
// ============================================================
// Montamos el router de health en /api/health.
// Esto significa que todas las rutas definidas en health.js
// van a tener /api/health como prefijo.
// Ejemplo: router.get('/') → responde en GET /api/health
app.use('/api/health', healthRouter);

// Montamos el router de rutinas en /api/rutinas.
// Esto significa que todas las rutas definidas en rutinaRoutes.js
// van a tener /api/rutinas como prefijo.
// Ejemplo: router.get('/:id') → responde en GET /api/rutinas/1
app.use('/api/rutinas', rutinaRouter);

// Montamos el router de sesiones en /api/sesiones.
// Ejemplo: router.post('/') → responde en POST /api/sesiones
app.use('/api/sesiones', sesionRouter);

// Montamos el router de autenticación en /api/auth.
// Ejemplos:
//   router.post('/register') → POST /api/auth/register
//   router.post('/login')    → POST /api/auth/login
app.use('/api/auth', authRouter);

// Montamos el router de ejercicios en /api/ejercicios.
// Ejemplo: router.get('/') → GET /api/ejercicios
app.use('/api/ejercicios', ejercicioRouter);

// Montamos el router de usuario en /api/usuarios.
// Ejemplo: router.delete('/me') → DELETE /api/usuarios/me
app.use('/api/usuarios', usuarioRouter);

// ============================================================
// 5. MIDDLEWARE DE ERRORES
// ============================================================
// Este middleware captura TODOS los errores que se pasan con
// next(error) desde cualquier ruta.
//
// Express lo identifica porque tiene 4 parámetros:
// (err, req, res, next) — si tuviera 3 sería un middleware normal
app.use((err, req, res, next) => {
  // Log del error en la consola del servidor (para debugging)
  console.error('Error:', err.message);

  // Respuesta al cliente con código 500 y mensaje genérico
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  });
});

// ============================================================
// 6. INICIAR EL SERVIDOR
// ============================================================
// app.listen() arranca el servidor HTTP en el puerto indicado.
// El callback se ejecuta cuando el servidor está listo.
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`  🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`  📡 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`  🖥️  Frontend:     http://localhost:${PORT}/`);
  console.log(`========================================`);
});
