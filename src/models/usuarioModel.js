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
    `SELECT id, nombre, email, avatar_url, created_at
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

module.exports = { desactivarUsuario, obtenerUsuarioPorId, actualizarAvatar };
