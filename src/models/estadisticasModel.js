// ============================================================
// MODELO DE ESTADÍSTICAS - Récords Personales (PRs)
// ============================================================
// Calcula el peso máximo histórico por ejercicio para un usuario.
//
// ¿CÓMO FUNCIONA?
// ---------------
// Recorre todas las sesiones del usuario, busca series
// completadas (completada = 1) y agrupa por ejercicio
// para obtener el máximo peso y repeticiones registrados.
//
// ¿PARA QUÉ SIRVE?
// -----------------
// Alimenta la vitrina de Récords Personales (PRs) en el
// perfil del usuario, mostrando sus mejores marcas históricas.

const pool = require('../config/db');

// ============================================================
// obtenerPRs(usuario_id)
// ============================================================
// Busca el peso máximo histórico de cada ejercicio que el
// usuario haya entrenado, considerando SOLO series marcadas
// como completadas.
//
// @param {number} usuario_id - ID del usuario autenticado
// @returns {Array} - Lista de PRs ordenados por peso descendente
async function obtenerPRs(usuario_id) {
  const sql = `
    SELECT
      e.id              AS ejercicio_id,
      e.nombre          AS ejercicio_nombre,
      MAX(ss.peso)      AS peso_maximo,
      MAX(ss.repeticiones) AS reps_maximas,
      COUNT(DISTINCT ss.sesion_ejercicio_id) AS veces_entrenado,
      COUNT(ss.id)      AS total_series_completadas
    FROM sesiones_entrenamiento se
    JOIN sesion_ejercicios sej ON sej.sesion_id = se.id
    JOIN sesion_series ss     ON ss.sesion_ejercicio_id = sej.id
    JOIN ejercicios e        ON e.id = sej.ejercicio_id
    WHERE se.usuario_id = ? AND ss.completada = 1
    GROUP BY e.id, e.nombre
    ORDER BY peso_maximo DESC
  `;

  const [rows] = await pool.execute(sql, [usuario_id]);
  return rows;
}

module.exports = { obtenerPRs };
