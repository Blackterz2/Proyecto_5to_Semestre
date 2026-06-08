// ============================================================
// MODELO DE EJERCICIO - Capa de acceso a datos
// ============================================================
// Esta capa es la ÚNICA que habla directamente con la base
// de datos para la tabla `ejercicios`.
//
// ⚠️ NO sabe nada de HTTP, Express, ni req/res.
//    Solo ejecuta SQL y devuelve datos.

const pool = require('../config/db');

// ============================================================
// obtenerTodos()
// ============================================================
// Devuelve TODOS los ejercicios del catálogo, ordenados por
// nombre alfabéticamente, con los grupos musculares asociados
// en un campo 'musculos' separado por coma.
//
// ¿Para qué se usa?
//   1. Poblar los checkboxes del modal "Nueva Rutina"
//   2. Poblar el panel de "Agregar Ejercicio Extra"
//   3. Filtrar por nombre o grupo muscular en el buscador
//
// Retorna:
//   Array de { id, nombre, descripcion, categoria, imagen_url, musculos }
async function obtenerTodos() {
  const sql = `
    SELECT
      e.id,
      e.nombre,
      e.descripcion,
      e.categoria,
      e.imagen_url,
      GROUP_CONCAT(DISTINCT gm.nombre ORDER BY gm.nombre SEPARATOR ', ') AS musculos
    FROM ejercicios e
    LEFT JOIN ejercicios_grupos_musculares eg ON e.id = eg.ejercicio_id
    LEFT JOIN grupos_musculares gm ON eg.grupo_muscular_id = gm.id
    GROUP BY e.id, e.nombre, e.descripcion, e.categoria, e.imagen_url
    ORDER BY e.nombre ASC
  `;
  const [rows] = await pool.execute(sql);
  return rows;
}

module.exports = { obtenerTodos };
