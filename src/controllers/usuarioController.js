// ============================================================
// CONTROLADOR DE USUARIO - Gestión de cuenta + perfil
// ============================================================
// Operaciones:
//   DELETE /api/usuarios/me     → desactivar cuenta
//   GET    /api/usuarios/me     → obtener perfil
//   POST   /api/usuarios/avatar → subir foto de perfil
//
// El middleware verificarToken se ejecuta ANTES de llegar
// acá, así que req.usuario.usuario_id está siempre disponible.

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { desactivarUsuario, obtenerUsuarioPorId, actualizarAvatar } = require('../models/usuarioModel');

// ============================================================
// CONFIGURACIÓN DE MULTER — Subida de avatares
// ============================================================
//
// ¿CÓMO FUNCIONA MULTER?
// ----------------------
// Multer es un middleware de Express que procesa archivos
// enviados con multipart/form-data (FormData en JS).
//
// 1. El frontend arma un FormData con el archivo
// 2. Multer intercepta la request ANTES del controlador
// 3. Lee el archivo del campo 'avatar', lo valida y guarda
// 4. Agrega req.file con la info del archivo guardado
// 5. El controlador ejecuta después y puede usar req.file

const AVATAR_DIR = path.join(__dirname, '..', '..', 'public', 'images', 'avatars');

// Asegurar que la carpeta exista
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    // Nombre único: avatar-{usuarioId}.{ext}
    // Ej: avatar-5.jpg — sobrescribe si ya existe una foto
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.usuario.usuario_id}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
});

// ============================================================
// eliminarCuenta(req, res) - DELETE /api/usuarios/me
// ============================================================
async function eliminarCuenta(req, res) {
  try {
    const usuarioId = req.usuario.usuario_id;

    const desactivado = await desactivarUsuario(usuarioId);

    if (!desactivado) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      status: 'ok',
      message: 'Cuenta desactivada correctamente',
    });

  } catch (error) {
    console.error('Error al desactivar cuenta:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

// ============================================================
// obtenerPerfil(req, res) - GET /api/usuarios/me
// ============================================================
// Devuelve los datos del perfil del usuario autenticado:
//   { id, nombre, email, avatar_url, created_at }
//
// Se usa desde el frontend para cargar:
//   - Nombre y email en la vista Perfil
//   - La URL del avatar para mostrar la foto
async function obtenerPerfil(req, res) {
  try {
    const usuarioId = req.usuario.usuario_id;
    const usuario = await obtenerUsuarioPorId(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      status: 'ok',
      data: usuario,
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

// ============================================================
// subirAvatar(req, res) - POST /api/usuarios/avatar
// ============================================================
// Recibe un archivo del campo 'avatar', lo guarda en el
// servidor y actualiza avatar_url en la base de datos.
//
// Flujo:
//   1. Multer procesa el archivo (ANTES de este controller)
//   2. req.file tiene los datos del archivo guardado
//   3. Construimos la URL pública accesible desde el frontend
//   4. Actualizamos avatar_url en la DB
//   5. Respondemos con la nueva URL
async function subirAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No se envió ningún archivo',
      });
    }

    // Construir URL pública: /images/avatars/avatar-5.jpg
    const avatarUrl = '/images/avatars/' + req.file.filename;

    // Guardar en la base de datos
    await actualizarAvatar(req.usuario.usuario_id, avatarUrl);

    res.json({
      status: 'ok',
      data: { avatar_url: avatarUrl },
    });

  } catch (error) {
    console.error('Error al subir avatar:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al subir la foto de perfil',
    });
  }
}

module.exports = { eliminarCuenta, obtenerPerfil, subirAvatar, upload };
