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
const { eliminarCuenta, obtenerPerfil, putPerfil, putContrasena, subirAvatar, upload, postOnboarding, getPerfilData, patchPerfilData } = require('../controllers/usuarioController');

const router = Router();

// DELETE /api/usuarios/me - Desactivar cuenta del usuario autenticado
router.delete('/me', verificarToken, eliminarCuenta);

// GET /api/usuarios/me - Obtener datos del perfil
router.get('/me', verificarToken, obtenerPerfil);

// POST /api/usuarios/avatar - Subir foto de perfil
// Multer procesa el archivo ANTES del controlador
// El campo del formulario debe llamarse 'avatar'
router.post('/avatar', verificarToken, upload.single('avatar'), subirAvatar);

// PUT /api/usuarios/me - Actualizar nombre del perfil (Hito 2)
// Genera un nuevo JWT con el nombre actualizado en el payload.
router.put('/me', verificarToken, putPerfil);

// PUT /api/usuarios/contrasena - Cambiar contraseña (Hito 2)
// Verifica la contraseña actual antes de cambiarla.
router.put('/contrasena', verificarToken, putContrasena);

// POST /api/usuarios/onboarding - Completar onboarding del usuario
router.post('/onboarding', verificarToken, postOnboarding);

// GET /api/usuarios/perfil - Datos para la vitrina "Mis Datos"
router.get('/perfil', verificarToken, getPerfilData);

// PATCH /api/usuarios/perfil - Actualizar datos corporales
router.patch('/perfil', verificarToken, patchPerfilData);

module.exports = router;
