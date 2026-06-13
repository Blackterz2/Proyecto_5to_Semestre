// ============================================================
// MODELO DE RUTINA - Capa de acceso a datos
// ============================================================
// Esta capa es la ÚNICA que habla directamente con la base
// de datos. Recibe parámetros, ejecuta SQL, devuelve datos.
//
// ⚠️ NO sabe nada de HTTP, ni de Express, ni de req/res.
//    Si mañana cambiamos de REST a GraphQL, este archivo
//    NO se toca. Esa es la gracia de la separación en capas.

const pool = require('../config/db');

// ============================================================
// obtenerRutinaConEjercicios(rutinaId)
// ============================================================
// Devuelve UNA rutina con TODOS sus ejercicios asociados en
// un solo objeto JSON anidado.
//
// ¿Cómo funciona?
//   1. Ejecuta un JOIN que trae la rutina + ejercicios en
//      UNA SOLA consulta a la DB (1 solo viaje redondo).
//   2. El resultado de SQL es TABULAR (filas y columnas).
//      Si una rutina tiene 5 ejercicios, recibís 5 filas,
//      cada una con los datos de la rutina repetidos.
//   3. En JavaScript reestructuramos eso a un objeto anidado.
//      Es decir: transformamos lo TABULAR en lo JERÁRQUICO.
//
// ¿Por qué un LEFT JOIN y no dos queries separadas?
//   - Una query con JOIN = 1 viaje a la DB
//   - Dos queries separadas = 2 viajes a la DB
//   - En desarrollo no se nota, pero con 1000 requests por
//     segundo, la diferencia es ABISMAL.
//
// Parámetros:
//   rutinaId (number) - ID de la rutina a buscar
//
// Retorna:
//   { id, nombre, descripcion, ejercicios: [...] }
//   o null si la rutina no existe
async function obtenerRutinaConEjercicios(rutinaId, usuarioId) {
  // ============================================================
  // CONSULTA SQL con JOIN
  // ============================================================
  // La query une 3 tablas:
  //   rutinas            → r (datos de la rutina)
  //   ejercicios_rutinas → er (tabla pivote: relación N a N)
  //   ejercicios         → e (datos de cada ejercicio)
  //
  // LEFT JOIN: si una rutina no tiene ejercicios, igual
  // la devolvemos (con lista vacía en vez de error).
  //
  // Usamos ALIAS (AS) para renombrar columnas y evitar
  // conflictos cuando dos tablas tienen columnas con el
  // mismo nombre (ej: r.id vs e.id).
  //
  // El ? es un PLACEHOLDER. mysql2 lo reemplaza de forma
  // SEGURA escapando el valor. Así prevenimos INYECCIÓN SQL.
  const sql = `
    SELECT
      r.id          AS rutina_id,
      r.nombre      AS rutina_nombre,
      r.descripcion AS rutina_descripcion,
      e.id          AS ejercicio_id,
      e.nombre      AS ejercicio_nombre,
      e.descripcion AS ejercicio_descripcion,
      er.orden,
      er.series,
      er.repeticiones,
      er.peso
    FROM rutinas r
    LEFT JOIN ejercicios_rutinas er ON r.id = er.rutina_id
    LEFT JOIN ejercicios e ON er.ejercicio_id = e.id
    WHERE r.id = ? AND r.usuario_id = ? AND r.activa = TRUE
    ORDER BY er.orden ASC
  `;

  // ============================================================
  // EJECUCIÓN DE LA CONSULTA
  // ============================================================
  // pool.execute(sql, [rutinaId]):
  //   - 1er parámetro: la consulta SQL
  //   - 2do parámetro: array con los valores para los ?
  //     (aunque sea 1 valor, va dentro de un array)
  //
  // Devuelve [rows, fields]:
  //   - rows:   array de objetos (las filas resultantes)
  //   - fields: metadatos de las columnas (no lo usamos)
  const [rows] = await pool.execute(sql, [rutinaId, usuarioId]);

  // ============================================================
  // ¿LA RUTINA EXISTE?
  // ============================================================
  // Si no hay filas, significa que no hay ninguna rutina
  // con ese ID en la base de datos → devolvemos null
  if (rows.length === 0) {
    return null;
  }

  // ============================================================
  // REESTRUCTURACIÓN: de TABULAR a JERÁRQUICO
  // ============================================================
  // El resultado de SQL es algo así:
  //
  //   rutina_id | rutina_nombre | ejercicio_id | ejercicio_nombre | orden
  //   ----------+---------------+--------------+------------------+-------
  //   1         | Pecho         | 1            | Press Banca      | 1
  //   1         | Pecho         | 2            | Aperturas        | 2
  //   1         | Pecho         | 3            | Pullover         | 3
  //
  // Una misma rutina aparece repetida en cada fila porque
  // el JOIN genera UNA FILA POR EJERCICIO.
  //
  // Queremos convertirlo en:
  //
  //   {
  //     id: 1,
  //     nombre: "Pecho",
  //     ejercicios: [
  //       { id: 1, nombre: "Press Banca", orden: 1, ... },
  //       { id: 2, nombre: "Aperturas",   orden: 2, ... },
  //     ]
  //   }
  //
  // Para eso: tomamos los datos de la rutina de la PRIMERA
  // fila (todas tienen los mismos datos de rutina), y
  // recorremos TODAS las filas construyendo el array
  // de ejercicios.

  // Extraemos los datos de la rutina desde la primera fila
  const rutina = {
    id:          rows[0].rutina_id,
    nombre:      rows[0].rutina_nombre,
    descripcion: rows[0].rutina_descripcion,
    ejercicios:  [],
  };

  // Recorremos cada fila y, si tiene un ejercicio asociado
  // (el LEFT JOIN puede traer NULL si no hay ejercicios),
  // lo agregamos al array.
  for (const fila of rows) {
    // Si la rutina no tiene ejercicios, ejercicio_id viene NULL
    if (fila.ejercicio_id !== null) {
      rutina.ejercicios.push({
        id:           fila.ejercicio_id,
        nombre:       fila.ejercicio_nombre,
        descripcion:  fila.ejercicio_descripcion,
        orden:        fila.orden,
        series:       fila.series,
        repeticiones: fila.repeticiones,
        peso:         fila.peso,
      });
    }
  }

  return rutina;
}

// ============================================================
// contarRutinasUsuario(usuario_id)
// ============================================================
// Cuenta cuántas rutinas tiene un usuario. Se usa ANTES de
// insertar una nueva para verificar el límite gratuito (4).
//
// El usuario_id viene del JWT, NO del body.
// Esto previene que un usuario cree rutinas en nombre de otro.
async function contarRutinasUsuario(usuario_id) {
  const sql = "SELECT COUNT(*) AS total FROM rutinas WHERE usuario_id = ? AND activa = TRUE AND es_recomendada = FALSE";
  const [rows] = await pool.execute(sql, [usuario_id]);
  return rows[0].total;
}

// ============================================================
// insertarRutina(usuario_id, nombre, descripcion)
// ============================================================
// Crea una nueva rutina para el usuario.
//
// Parámetros:
//   usuario_id  - ID del dueño (viene del JWT, no del body)
//   nombre      - Nombre de la rutina (ej: "Full Body")
//   descripcion - Descripción opcional
//
// Retorna:
//   { id, nombre, descripcion, usuario_id }
async function insertarRutina(usuario_id, nombre, descripcion) {
  const sql = `
    INSERT INTO rutinas (usuario_id, nombre, descripcion)
    VALUES (?, ?, ?)
  `;
  const [resultado] = await pool.execute(sql, [
    usuario_id,
    nombre,
    descripcion || null,
  ]);

  return {
    id: resultado.insertId,
    nombre,
    descripcion: descripcion || null,
    usuario_id,
  };
}

// ============================================================
// obtenerRutinasPorUsuario(usuario_id)
// ============================================================
// Devuelve TODAS las rutinas de un usuario (SIN ejercicios).
// Cada rutina incluye id, nombre, descripcion y cantidad de
// ejercicios asociados.
//
// ¿Por qué SIN ejercicios?
//   Porque la lista del dashboard solo muestra el nombre y
//   una descripción breve. Los ejercicios se cargan DESPUÉS
//   cuando el usuario hace clic en una rutina (GET /:id).
//
//   Esto evita hacer JOINs pesados para la lista general.
async function obtenerRutinasPorUsuario(usuario_id) {
  const sql = `
    SELECT
      r.id,
      r.nombre,
      r.descripcion,
      r.created_at,
      r.es_recomendada,
      (SELECT COUNT(*) FROM ejercicios_rutinas WHERE rutina_id = r.id) AS total_ejercicios
    FROM rutinas r
    WHERE r.usuario_id = ? AND r.activa = TRUE
    ORDER BY r.created_at DESC
  `;

  const [rows] = await pool.execute(sql, [usuario_id]);
  return rows;
}

// ============================================================
// insertarEjerciciosEnRutina(rutinaId, ejercicios_ids)
// ============================================================
// Asigna ejercicios a una rutina insertando filas en la tabla
// pivote `ejercicios_rutinas`.
//
// ¿Cómo funciona el orden?
//   - Primero cuenta cuántos ejercicios ya tiene la rutina
//     (por si ya tenía algunos asignados antes).
//   - El primer ejercicio nuevo arranca en orden = total_existente + 1
//   - Esto evita conflictos de orden aunque se llame varias veces.
//
// Parámetros:
//   rutinaId       (number) - ID de la rutina
//   ejercicios_ids (number[]) - Array de IDs de ejercicios a asignar
async function insertarEjerciciosEnRutina(rutinaId, ejercicios_ids) {
  if (!ejercicios_ids || ejercicios_ids.length === 0) return;

  // ============================================================
  // 1. CONTAR EJERCICIOS EXISTENTES
  // ============================================================
  // Necesitamos saber cuál es el próximo número de orden disponible.
  // Si la rutina ya tiene 3 ejercicios, el próximo orden será 4.
  const [countRows] = await pool.execute(
    'SELECT COUNT(*) AS total FROM ejercicios_rutinas WHERE rutina_id = ?',
    [rutinaId]
  );
  let orden = countRows[0].total + 1;

  // ============================================================
  // 2. INSERTAR CADA EJERCICIO
  // ============================================================
  // Por cada ID, insertamos una fila con su orden correspondiente.
  // Usamos Promise.all para lanzar TODAS las inserciones en
  // paralelo (más rápido que esperar una por una).
  //
  // ⚠️ NOTA: No usamos una transacción completa porque si alguna
  //    inserción falla, las anteriores ya se insertaron y la
  //    rutina ya se creó. En un sistema crítico haríamos todo
  //    en una transacción, pero acá es aceptable porque el
  //    INSERT de la rutina ya se confirmó.
  const promises = ejercicios_ids.map((ejercicioId) => {
    return pool.execute(
      `INSERT INTO ejercicios_rutinas (rutina_id, ejercicio_id, orden)
       VALUES (?, ?, ?)`,
      [rutinaId, ejercicioId, orden++]
    );
  });

  await Promise.all(promises);
}

// ============================================================
// desactivarRutina(rutinaId, usuarioId)
// ============================================================
// No borra la rutina de la BD, sino que marca activa = FALSE
// para que no aparezca en el listado del usuario.
//
// El historial de entrenamientos con esta rutina se conserva.
//
// Parámetros:
//   rutinaId  - ID de la rutina a desactivar
//   usuarioId - ID del dueño (viene del JWT)
//
// Retorna:
//   affectedRows - 1 si se desactivó, 0 si no existía o no era del usuario
async function desactivarRutina(rutinaId, usuarioId) {
  const sql = 'UPDATE rutinas SET activa = FALSE WHERE id = ? AND usuario_id = ?';
  const [result] = await pool.execute(sql, [rutinaId, usuarioId]);
  return result.affectedRows;
}

// Exportamos las funciones para que el controlador las use
module.exports = {
  obtenerRutinaConEjercicios,
  contarRutinasUsuario,
  insertarRutina,
  obtenerRutinasPorUsuario,
  insertarEjerciciosEnRutina,
  desactivarRutina,
};
