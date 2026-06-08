// ============================================================
// RUTAS DE EJERCICIO - Capa de enrutamiento
// ============================================================
// Mapea verbos + URLs a controladores para el recurso
// "ejercicios".
//
// ⚠️ NO tiene lógica. Solo enruta.

const { Router } = require('express');
const { getEjercicios } = require('../controllers/ejercicioController');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = Router();

// ============================================================
// GET / - Listar todos los ejercicios del catálogo
// ============================================================
// 🔒 Protegida con JWT: solo usuarios autenticados pueden
// ver el catálogo de ejercicios.
router.get('/', verificarToken, getEjercicios);

module.exports = router;
