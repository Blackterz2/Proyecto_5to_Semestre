// ============================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================
// Tan delgadas como siempre. Solo conectan verbos + URLs
// con controladores.

const { Router } = require('express');
const { register, login } = require('../controllers/authController');
const { solicitarReset, resetearPassword } = require('../controllers/passwordResetController');

const router = Router();

// POST /api/auth/register - Crear una cuenta nueva
router.post('/register', register);

// POST /api/auth/login - Iniciar sesión (devuelve JWT)
router.post('/login', login);

// POST /api/auth/forgot-password - Solicitar reseteo de contraseña (F2 Hito 3)
// Pública: no requiere token, solo email.
router.post('/forgot-password', solicitarReset);

// POST /api/auth/reset-password - Cambiar contraseña con token (F2 Hito 3)
// Pública: no requiere token, solo token + nueva contraseña.
router.post('/reset-password', resetearPassword);

module.exports = router;
