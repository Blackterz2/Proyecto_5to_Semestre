// ============================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================
// Tan delgadas como siempre. Solo conectan verbos + URLs
// con controladores.

const { Router } = require('express');
const { register, login } = require('../controllers/authController');

const router = Router();

// POST /api/auth/register - Crear una cuenta nueva
router.post('/register', register);

// POST /api/auth/login - Iniciar sesión (devuelve JWT)
router.post('/login', login);

module.exports = router;
