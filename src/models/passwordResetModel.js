// ============================================================
// MODELO DE RESETEO DE CONTRASEÑA
// ============================================================
// Operaciones sobre la tabla password_resets:
//   - guardarToken(usuarioId, token, expiraEn)
//   - buscarToken(token)        → con JOIN a usuarios
//   - marcarTokenUsado(token)
//
// NOTA: La tabla password_resets debe existir en la BD:
//
//   CREATE TABLE IF NOT EXISTS password_resets (
//     id          INT AUTO_INCREMENT PRIMARY KEY,
//     usuario_id  INT NOT NULL,
//     token       VARCHAR(64) NOT NULL UNIQUE,
//     expira_en   DATETIME NOT NULL,
//     usado       TINYINT(1) DEFAULT 0,
//     created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
//   );

const pool = require('../config/db');

// ============================================================
// guardarToken(usuarioId, token, expiraEn)
// ============================================================
// Inserta un nuevo token de reseteo en la base de datos.
async function guardarToken(usuarioId, token, expiraEn) {
  const [resultado] = await pool.execute(
    `INSERT INTO password_resets (usuario_id, token, expira_en) VALUES (?, ?, ?)`,
    [usuarioId, token, expiraEn]
  );
  return resultado.insertId;
}

// ============================================================
// buscarToken(token)
// ============================================================
// Busca un token válido (no usado, no expirado) y devuelve
// los datos del usuario asociado.
// Retorna { id, usuario_id, token, expira_en, usado, email, nombre }
// o null si no existe o expiró.
async function buscarToken(token) {
  const [rows] = await pool.execute(
    `SELECT pr.*, u.email, u.nombre
     FROM password_resets pr
     JOIN usuarios u ON u.id = pr.usuario_id
     WHERE pr.token = ? AND pr.usado = 0 AND pr.expira_en > NOW()`,
    [token]
  );
  return rows.length > 0 ? rows[0] : null;
}

// ============================================================
// marcarTokenUsado(token)
// ============================================================
// Marca un token como usado para que no pueda reutilizarse.
async function marcarTokenUsado(token) {
  const [resultado] = await pool.execute(
    `UPDATE password_resets SET usado = 1 WHERE token = ?`,
    [token]
  );
  return resultado.affectedRows > 0;
}

module.exports = { guardarToken, buscarToken, marcarTokenUsado };
