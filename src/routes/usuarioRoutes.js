// ============================================================
// RUTAS DE USUARIO - Gestión de cuenta + perfil
// ============================================================
// Tan delgadas como siempre. Solo conectan verbos + URLs
// con controladores.
//
// Middleware verificarToken:
//   Se ejecuta ANTES del controlador. Extrae el usuario_id
//   del JWT y lo guarda en req.usuario.

const { Router } = require('express');
const { verificarToken } = require('../middlewares/authMiddleware');
const { eliminarCuenta, obtenerPerfil, subirAvatar, upload } = require('../controllers/usuarioController');

const router = Router();

// DELETE /api/usuarios/me - Desactivar cuenta del usuario autenticado
router.delete('/me', verificarToken, eliminarCuenta);

// GET /api/usuarios/me - Obtener datos del perfil
router.get('/me', verificarToken, obtenerPerfil);

// POST /api/usuarios/avatar - Subir foto de perfil
// Multer procesa el archivo ANTES del controlador
// El campo del formulario debe llamarse 'avatar'
router.post('/avatar', verificarToken, upload.single('avatar'), subirAvatar);

module.exports = router;
