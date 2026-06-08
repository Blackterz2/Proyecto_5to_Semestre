// ============================================================
// MODELO DE AUTENTICACIÓN - Acceso a datos de usuarios
// ============================================================
// Esta capa es la única que ejecuta SQL relacionado con
// usuarios. No sabe nada de bcrypt, JWT, HTTP ni nada.
// Solo sabe insertar y buscar en la tabla usuarios.

const pool = require('../config/db');

// ============================================================
// crearUsuario(nombre, email, passwordHash)
// ============================================================
// Crea un nuevo usuario en la base de datos.
//
// Recibe:
//   - nombre:       string (nombre del usuario)
//   - email:        string (email único)
//   - passwordHash: string (contraseña YA hasheada con bcrypt)
//
// Devuelve:
//   - { id, nombre, email } del usuario creado
//
// NOTA: No guardamos la contraseña original, SOLO el hash.
//       Ni siquiera este modelo ve la contraseña en texto
//       plano — el hash llega ya calculado desde el controller.
async function crearUsuario(nombre, email, passwordHash) {
  const [resultado] = await pool.execute(
    `INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)`,
    [nombre, email, passwordHash]
  );

  return {
    id:     resultado.insertId,
    nombre,
    email,
  };
}

// ============================================================
// buscarUsuarioPorEmail(email)
// ============================================================
// Busca un usuario por su email. Se usa tanto en registro
// (para verificar que no exista) como en login (para
// obtener el hash y comparar contraseñas).
//
// Devuelve:
//   - El usuario COMPLETO (incluyendo password hash) si existe
//   - null si no existe
//
// ⚠️ Incluye el password hash en el resultado. Esto es
//    necesario para que el controller pueda compararlo
//    con bcrypt.compare(). Pero NUNCA devolvemos el hash
//    al cliente (en la respuesta HTTP solo va id, nombre, email).
async function buscarUsuarioPorEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, nombre, email, password, created_at, activo
     FROM usuarios WHERE email = ?`,
    [email]
  );

  return rows.length > 0 ? rows[0] : null;
}

module.exports = { crearUsuario, buscarUsuarioPorEmail };
