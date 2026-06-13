// ============================================================
// RUTAS DE SESIÓN - Capa de enrutamiento
// ============================================================
// Tan delgada como las de rutina. Solo conecta POST /
// con el controlador.

const { Router } = require('express');
const { crearSesion, getHistorial, getUltimaSesion } = require('../controllers/sesionController');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = Router();

// GET /api/sesiones - Obtener historial del usuario autenticado
// 🔒 Protegida con JWT: devuelve SOLO las sesiones del usuario del token
router.get('/', verificarToken, getHistorial);

// POST /api/sesiones - Crear una nueva sesión de entrenamiento
// 🔒 Protegida con JWT: solo usuarios autenticados pueden crear sesiones
// El usuario_id se extrae del TOKEN, no del body (previene ID Spoofing)
router.post('/', verificarToken, crearSesion);

// GET /api/sesiones/ultima/:rutina_id - Última sesión de una rutina (para sobrecarga progresiva)
// 🔒 Protegida con JWT: devuelve SOLO las sesiones del usuario del token
router.get('/ultima/:rutina_id', verificarToken, getUltimaSesion);

module.exports = router;
