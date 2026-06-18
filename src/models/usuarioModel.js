// ============================================================
// MODELO DE USUARIO - Operaciones de gestión de cuenta
// ============================================================
// Esta capa es la única que ejecuta SQL relacionado con
// la gestión de la cuenta del usuario.
//
// Operaciones:
//   - desactivarUsuario(id)  → soft delete (activo = FALSE)
//   - obtenerUsuarioPorId(id) → perfil público (sin password)
//   - actualizarAvatar(id, url) → guardar ruta de foto

const pool = require('../config/db');

// ============================================================
// desactivarUsuario(usuarioId)
// ============================================================
async function desactivarUsuario(usuarioId) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios SET activo = FALSE WHERE id = ?`,
    [usuarioId]
  );

  return resultado.affectedRows > 0;
}

// ============================================================
// obtenerUsuarioPorId(usuarioId)
// ============================================================
// Devuelve los datos públicos del usuario (SIN password hash).
// Se usa para mostrar el perfil en el frontend.
async function obtenerUsuarioPorId(usuarioId) {
  const [rows] = await pool.execute(
    `SELECT id, nombre, email, avatar_url, created_at, onboarding_completado
     FROM usuarios WHERE id = ?`,
    [usuarioId]
  );

  return rows.length > 0 ? rows[0] : null;
}

// ============================================================
// actualizarAvatar(usuarioId, avatarUrl)
// ============================================================
// Guarda la ruta de la foto de perfil en la base de datos.
async function actualizarAvatar(usuarioId, avatarUrl) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios SET avatar_url = ? WHERE id = ?`,
    [avatarUrl, usuarioId]
  );

  return resultado.affectedRows > 0;
}

// ============================================================
// actualizarPerfil(usuarioId, nombre)
// ============================================================
// Actualiza el nombre del usuario autenticado.
async function actualizarPerfil(usuarioId, nombre) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios SET nombre = ? WHERE id = ?`,
    [nombre, usuarioId]
  );
  return resultado.affectedRows > 0;
}

// ============================================================
// obtenerPasswordUsuario(usuarioId)
// ============================================================
// Obtiene EXCLUSIVAMENTE el hash de la contraseña del usuario.
// Se usa para verificar la contraseña actual al cambiarla.
// NOTA: No incluir otros campos por seguridad — este método
// solo existe para el flujo de cambio de contraseña.
async function obtenerPasswordUsuario(usuarioId) {
  const [rows] = await pool.execute(
    `SELECT password FROM usuarios WHERE id = ?`,
    [usuarioId]
  );
  return rows.length > 0 ? rows[0].password : null;
}

// ============================================================
// cambiarContrasena(usuarioId, hashNueva)
// ============================================================
// Reemplaza el hash de la contraseña por uno nuevo.
async function cambiarContrasena(usuarioId, hashNueva) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios SET password = ? WHERE id = ?`,
    [hashNueva, usuarioId]
  );
  return resultado.affectedRows > 0;
}

// ============================================================
// completarOnboarding(usuarioId, datos)
// ============================================================
// Guarda los datos biométricos y marca onboarding como completo.
async function completarOnboarding(usuarioId, datos) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios
     SET nivel_experiencia = ?, sexo = ?, peso_actual = ?, estatura_cm = ?, onboarding_completado = TRUE
     WHERE id = ?`,
    [datos.nivel_experiencia, datos.sexo || 'Otro', datos.peso_actual || null, datos.estatura_cm || null, usuarioId]
  );

  return resultado.affectedRows > 0;
}

// ============================================================
// obtenerDatosPerfil(usuarioId)
// ============================================================
// Devuelve SOLO los campos que se muestran en "Mis Datos"
// del perfil: nombre, email, peso_actual, estatura_cm,
// nivel_experiencia.
async function obtenerDatosPerfil(usuarioId) {
  const [rows] = await pool.execute(
    `SELECT nombre, email, peso_actual, estatura_cm, nivel_experiencia
     FROM usuarios WHERE id = ?`,
    [usuarioId]
  );

  return rows.length > 0 ? rows[0] : null;
}

// ============================================================
// actualizarDatosPerfil(usuarioId, datos)
// ============================================================
// Actualiza peso_actual, estatura_cm y nivel_experiencia.
// Recibe un objeto con los campos nombre, email, peso_actual,
// estatura_cm, nivel_experiencia — aunque solo actualiza los
// que se editan desde el perfil.
async function actualizarDatosPerfil(usuarioId, datos) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios
     SET peso_actual = ?, estatura_cm = ?, nivel_experiencia = ?
     WHERE id = ?`,
    [datos.peso_actual ?? null, datos.estatura_cm ?? null, datos.nivel_experiencia || 'Principiante', usuarioId]
  );

  return resultado.affectedRows > 0;
}

// ============================================================
// emailExiste(email, excluirId)
// ============================================================
// Verifica si un email ya está registrado por OTRO usuario
// (excluye el id del usuario actual para permitir mantener
// el mismo email sin falsos positivos).
async function emailExiste(email, excluirId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM usuarios WHERE email = ? AND id != ?`,
    [email, excluirId]
  );
  return rows[0].total > 0;
}

// ============================================================
// actualizarDatosCompletos(usuarioId, datos)
// ============================================================
// UPDATE único para nombre, email, peso_actual, estatura_cm
// y nivel_experiencia. Se llama desde el PATCH /perfil.
async function actualizarDatosCompletos(usuarioId, datos) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios
     SET nombre = ?, email = ?, peso_actual = ?, estatura_cm = ?, nivel_experiencia = ?
     WHERE id = ?`,
    [
      datos.nombre,
      datos.email,
      datos.peso_actual ?? null,
      datos.estatura_cm ?? null,
      datos.nivel_experiencia || 'Principiante',
      usuarioId,
    ]
  );

  return resultado.affectedRows > 0;
}

module.exports = { desactivarUsuario, obtenerUsuarioPorId, actualizarAvatar, completarOnboarding, actualizarPerfil, obtenerPasswordUsuario, cambiarContrasena, obtenerDatosPerfil, actualizarDatosPerfil, emailExiste, actualizarDatosCompletos };
