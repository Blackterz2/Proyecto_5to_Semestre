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
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { desactivarUsuario, obtenerUsuarioPorId, actualizarAvatar, completarOnboarding, actualizarPerfil, obtenerPasswordUsuario, cambiarContrasena } = require('../models/usuarioModel');
const pool = require('../config/db');

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
// putPerfil(req, res) - PUT /api/usuarios/me
// ============================================================
// Actualiza el nombre del usuario autenticado y genera un
// NUEVO token JWT con el nombre actualizado en el payload.
//
// ¿Por qué un nuevo token?
//   El frontend extrae el nombre del token para mostrarlo
//   en la UI (extraerNombreDelToken). Si no regeneramos el
//   token, el nombre viejo queda cacheado hasta el próximo
//   login. El nuevo token mantiene la misma sesión (mismo
//   usuario_id, misma expiración) pero con el nombre nuevo.
async function putPerfil(req, res) {
  try {
    const usuarioId = req.usuario.usuario_id;
    const { nombre } = req.body;

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El nombre es obligatorio',
      });
    }

    if (nombre.trim().length > 50) {
      return res.status(400).json({
        status: 'error',
        message: 'El nombre no puede superar los 50 caracteres',
      });
    }

    // ============================================================
    // ACTUALIZAR EN BASE DE DATOS
    // ============================================================
    const nombreLimpio = nombre.trim();
    const actualizado = await actualizarPerfil(usuarioId, nombreLimpio);

    if (!actualizado) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    // ============================================================
    // GENERAR NUEVO TOKEN CON EL NOMBRE ACTUALIZADO
    // ============================================================
    const payload = {
      usuario_id: usuarioId,
      nombre:     nombreLimpio,
      email:      req.usuario.email, // mantener el email del token original
    };

    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'mi_clave_secreta_cambiame_en_produccion') {
      console.error('⚠️ JWT_SECRET no configurado en .env');
      return res.status(500).json({
        status: 'error',
        message: 'Error de configuración del servidor',
      });
    }

    const nuevoToken = jwt.sign(payload, secret, { expiresIn: '7d' });

    // ============================================================
    // RESPONDER
    // ============================================================
    res.json({
      status: 'ok',
      data: { nombre: nombreLimpio },
      token: nuevoToken,
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

// ============================================================
// putContrasena(req, res) - PUT /api/usuarios/contrasena
// ============================================================
// Cambia la contraseña del usuario autenticado.
//
// FLUJO:
//   1. Recibe { passwordActual, passwordNueva }
//   2. Busca el hash actual en la DB
//   3. Verifica que passwordActual coincida con bcrypt.compare()
//   4. Valida que passwordNueva tenga mínimo 8 caracteres
//   5. Hashea la nueva contraseña
//   6. Actualiza en la DB
async function putContrasena(req, res) {
  try {
    const usuarioId = req.usuario.usuario_id;
    const { passwordActual, passwordNueva } = req.body;

    // ============================================================
    // VALIDACIONES
    // ============================================================
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        status: 'error',
        message: 'Los campos passwordActual y passwordNueva son obligatorios',
      });
    }

    if (passwordNueva.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'La nueva contraseña debe tener al menos 8 caracteres',
      });
    }

    // ============================================================
    // VERIFICAR CONTRASEÑA ACTUAL
    // ============================================================
    const hashActual = await obtenerPasswordUsuario(usuarioId);

    if (!hashActual) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    const passwordValida = await bcrypt.compare(passwordActual, hashActual);

    if (!passwordValida) {
      return res.status(401).json({
        status: 'error',
        message: 'Contraseña actual incorrecta',
      });
    }

    // ============================================================
    // HASHEAR Y GUARDAR NUEVA CONTRASEÑA
    // ============================================================
    const saltRounds = 10;
    const hashNueva = await bcrypt.hash(passwordNueva, saltRounds);

    await cambiarContrasena(usuarioId, hashNueva);

    res.json({
      status: 'ok',
      message: 'Contraseña actualizada',
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error.message);
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

// ============================================================
// postOnboarding(req, res) - POST /api/usuarios/onboarding
// ============================================================
// Recibe { nivel_experiencia, sexo, peso_actual, estatura_cm,
//          quiere_recomendacion }
// Si quiere_recomendacion es true y es Principiante, calcula el
// IMC y asigna una rutina inteligente según el resultado:
//   IMC >= 25 → Bajo Impacto
//   IMC < 25 + Masculino → Fuerza Base
//   IMC < 25 + Femenino → Tonificación
async function postOnboarding(req, res) {
  try {
    const usuarioId = req.usuario.usuario_id;
    const { nivel_experiencia, sexo, peso_actual, estatura_cm, quiere_recomendacion } = req.body;

    // Validar campo obligatorio
    if (!nivel_experiencia) {
      return res.status(400).json({
        status: 'error',
        message: 'El campo nivel_experiencia es obligatorio',
      });
    }

    const valoresValidos = ['Principiante', 'Intermedio', 'Avanzado'];
    if (!valoresValidos.includes(nivel_experiencia)) {
      return res.status(400).json({
        status: 'error',
        message: `nivel_experiencia debe ser uno de: ${valoresValidos.join(', ')}`,
      });
    }

    // Validar sexo (opcional pero si viene, debe ser válido)
    const sexosValidos = ['Masculino', 'Femenino', 'Otro'];
    if (sexo !== undefined && sexo !== null && !sexosValidos.includes(sexo)) {
      return res.status(400).json({
        status: 'error',
        message: `sexo debe ser uno de: ${sexosValidos.join(', ')}`,
      });
    }

    // Validar campos opcionales (si vienen, deben ser números)
    if (peso_actual !== undefined && peso_actual !== null && (isNaN(Number(peso_actual)) || Number(peso_actual) <= 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'peso_actual debe ser un número positivo',
      });
    }
    if (estatura_cm !== undefined && estatura_cm !== null && (isNaN(Number(estatura_cm)) || Number(estatura_cm) <= 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'estatura_cm debe ser un número positivo',
      });
    }

    const datos = {
      nivel_experiencia,
      sexo: sexo || 'Otro',
      peso_actual: peso_actual ? Number(peso_actual) : null,
      estatura_cm: estatura_cm ? Number(estatura_cm) : null,
    };

    const actualizado = await completarOnboarding(usuarioId, datos);
    if (!actualizado) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    // ============================================================
    // REGLA DE NEGOCIO: Auto-rutina recomendada (solo si el
    // usuario la aceptó explícitamente y es Principiante)
    // ============================================================
    if (quiere_recomendacion && nivel_experiencia === 'Principiante') {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Calcular IMC
        const peso = Number(peso_actual);
        const altura = Number(estatura_cm);
        let rutinaNombre, rutinaDesc, busquedas = [];

        if (peso && altura && altura > 0) {
          const imc = peso / Math.pow(altura / 100, 2);

          if (imc >= 25) {
            // Bajo Impacto — movilidad, sin saltos
            rutinaNombre = 'Adaptación: Bajo Impacto';
            rutinaDesc = 'Rutina de movilidad y ejercicios de bajo impacto. Ideal para empezar sin riesgos.';
            busquedas = [
              '%sentadilla con el peso corporal%',
              '%press de banca con mancuernas%',
              '%remo con mancuerna%',
            ];
          } else if (sexo === 'Masculino') {
            // Fuerza Base — tren superior
            rutinaNombre = 'Adaptación: Fuerza Base';
            rutinaDesc = 'Rutina enfocada en desarrollar fuerza del tren superior. Ideal para tus primeros meses.';
            busquedas = [
              '%press de banca%',
              '%remo con barra%',
              '%press militar%',
            ];
          } else if (sexo === 'Femenino') {
            // Tonificación — tren inferior
            rutinaNombre = 'Adaptación: Tonificación';
            rutinaDesc = 'Rutina enfocada en tonificar piernas y glúteos. Perfecta para tus primeros días.';
            busquedas = [
              '%sentadilla búlgara%',
              '%empuje de cadera%',
              '%curl femoral%',
            ];
          }
        } else {
          // Fallback si faltan peso/altura
          rutinaNombre = 'Adaptación - Cuerpo Completo';
          rutinaDesc = 'Rutina ideal para tus primeros días';
          busquedas = ['%sentadilla%', '%press de banca%', '%remo%'];
        }

        // Crear rutina con es_recomendada = TRUE
        const [rutinaResult] = await connection.execute(
          `INSERT INTO rutinas (usuario_id, nombre, descripcion, es_recomendada) VALUES (?, ?, ?, TRUE)`,
          [usuarioId, rutinaNombre, rutinaDesc]
        );
        const rutinaId = rutinaResult.insertId;

        // Buscar ejercicios con fallbacks
        const ejerciciosEncontrados = [];
        for (const termino of busquedas) {
          const [rows] = await connection.execute(
            `SELECT id FROM ejercicios WHERE LOWER(nombre) LIKE LOWER(?) LIMIT 1`,
            [termino]
          );
          if (rows.length > 0) {
            ejerciciosEncontrados.push(rows[0].id);
          }
        }

        // Generic fallback para búsquedas que no encontraron nada
        const ejerciciosFallback = ['%sentadilla%', '%press%', '%remo%'];
        for (let i = 0; i < ejerciciosFallback.length && ejerciciosEncontrados.length < 3; i++) {
          const [rows] = await connection.execute(
            `SELECT id FROM ejercicios WHERE LOWER(nombre) LIKE LOWER(?) LIMIT 1`,
            [ejerciciosFallback[i]]
          );
          if (rows.length > 0 && !ejerciciosEncontrados.includes(rows[0].id)) {
            ejerciciosEncontrados.push(rows[0].id);
          }
        }

        // Insertar ejercicios_rutinas
        const ordenes = [
          { orden: 1, series: 3, repeticiones: 12 },
          { orden: 2, series: 3, repeticiones: 12 },
          { orden: 3, series: 3, repeticiones: 12 },
        ];

        for (let i = 0; i < ejerciciosEncontrados.length && i < 3; i++) {
          await connection.execute(
            `INSERT INTO ejercicios_rutinas (rutina_id, ejercicio_id, orden, series, repeticiones) VALUES (?, ?, ?, ?, ?)`,
            [rutinaId, ejerciciosEncontrados[i], ordenes[i].orden, ordenes[i].series, ordenes[i].repeticiones]
          );
        }

        await connection.commit();
      } catch (txError) {
        await connection.rollback();
        console.error('Error en transacción de auto-rutina:', txError.message);
        // No fallamos la respuesta — el onboarding ya se guardó
      } finally {
        connection.release();
      }
    }

    res.json({
      status: 'ok',
      message: 'Onboarding completado',
    });

  } catch (error) {
    console.error('Error en postOnboarding:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

module.exports = { eliminarCuenta, obtenerPerfil, putPerfil, putContrasena, subirAvatar, upload, postOnboarding };
