// ============================================================
// RUTAS DE SESIÓN - Capa de enrutamiento
// ============================================================
// Tan delgada como las de rutina. Solo conecta POST /
// con el controlador.

const { Router } = require('express');
const { crearSesion } = require('../controllers/sesionController');

const router = Router();

// POST /api/sesiones - Crear una nueva sesión de entrenamiento
// Recibe en el body: { usuario_id, rutina_id, fecha, notas, ejercicios }
router.post('/', crearSesion);

module.exports = router;
