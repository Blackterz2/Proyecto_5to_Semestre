// ============================================================
// MODELO DE SESIÓN - Guardado con Transacciones SQL
// ============================================================
// Este modelo guarda una sesión de entrenamiento COMPLETA
// (sesión + ejercicios + series) en 3 tablas distintas,
// usando una TRANSACCIÓN de MySQL.
//
// ¿QUÉ ES UNA TRANSACCIÓN?
// ------------------------
// Una transacción agrupa VARIAS operaciones SQL en un solo
// bloque atómico. Pasa TODO o pasa NADA.
//
//   BEGIN;                      ← acá arranca la transacción
//   INSERT INTO sesiones...;    ← operación 1
//   INSERT INTO sesion_ejercicios...; ← operación 2
//   INSERT INTO sesion_series...;     ← operación 3
//   COMMIT;                     ← si todo salió bien, guardá TODO
//
// Si en cualquier punto del medio ocurre un error:
//   ROLLBACK;                   ← borrá TODO como si nada hubiera pasado
//
// ¿POR QUÉ ES IMPORTANTE?
// ------------------------
// Sin transacción, si el servidor se cae después de insertar
// la sesión pero antes de insertar los ejercicios, te queda
// una sesión huérfana sin ejercicios. Datos corruptos.
//
// Con transacción, si algo falla, es como si nunca hubieras
// insertado nada. La base de datos queda consistente SIEMPRE.

const pool = require('../config/db');

// ============================================================
// guardarSesionCompleta(datosSesion)
// ============================================================
// datosSesion = {
//   usuario_id: 1,
//   rutina_id: 1,
//   fecha: "2026-06-05",
//   notas: "Buena sesión",
//   ejercicios: [
//     {
//       ejercicio_id: 1,
//       observaciones: "Dolor en hombro",
//       series: [
//         { numero_serie: 1, repeticiones: 10, peso: 50, rpe: 8 },
//         { numero_serie: 2, repeticiones: 8,  peso: 55, rpe: 9 }
//       ]
//     }
//   ]
// }
async function guardarSesionCompleta(datosSesion) {
  // ============================================================
  // 1. PEDIR UNA CONEXIÓN DEDICADA DEL POOL
  // ============================================================
  // Normalmente el pool asigna y libera conexiones automáticamente
  // con pool.execute(). Pero para TRANSACCIONES necesitamos
  // controlar MANUALMENTE una conexión, porque el BEGIN, COMMIT
  // y ROLLBACK deben ejecutarse en la MISMA conexión.
  //
  // pool.getConnection() nos da UNA conexión del pool que
  // tenemos que liberar explícitamente con release().
  const connection = await pool.getConnection();

  try {
    // ============================================================
    // 2. INICIAR LA TRANSACCIÓN
    // ============================================================
    // A partir de acá, todas las queries que ejecutemos en
    // esta conexión son parte de la MISMA transacción.
    // Nada se guarda realmente hasta que hagamos COMMIT.
    await connection.beginTransaction();

    // ============================================================
    // 3. INSERTAR LA SESIÓN DE ENTRENAMIENTO
    // ============================================================
    // Insertamos en sesiones_entrenamiento y recuperamos el
    // ID que MySQL generó automáticamente (AUTO_INCREMENT).
    //
    // insertId: es una propiedad del resultado que mysql2
    // devuelve después de un INSERT. Contiene el valor del
    // AUTO_INCREMENT que se generó para esa fila.
    const [resultadoSesion] = await connection.execute(
      `INSERT INTO sesiones_entrenamiento (usuario_id, rutina_id, fecha, notas)
       VALUES (?, ?, ?, ?)`,
      [
        datosSesion.usuario_id,
        datosSesion.rutina_id,
        datosSesion.fecha,
        datosSesion.notas || null,
      ]
    );
    const sesionId = resultadoSesion.insertId;

    // ============================================================
    // 4. ITERAR SOBRE LOS EJERCICIOS
    // ============================================================
    // Por cada ejercicio que nos mandaron:
    //   a. Insertamos en sesion_ejercicios (vinculado a la sesión)
    //   b. Por cada serie de ese ejercicio, insertamos en sesion_series
    //
    // Usamos un for...of tradicional (NO forEach) porque
    // necesitamos AWAIT adentro y que las inserciones sean
    // secuenciales en el orden correcto.
    for (const ejercicio of datosSesion.ejercicios) {
      // ============================================================
      // 4a. INSERTAR EL EJERCICIO DE LA SESIÓN
      // ============================================================
      const [resultadoEjercicio] = await connection.execute(
        `INSERT INTO sesion_ejercicios (sesion_id, ejercicio_id, observaciones)
         VALUES (?, ?, ?)`,
        [sesionId, ejercicio.ejercicio_id, ejercicio.observaciones || null]
      );
      const sesionEjercicioId = resultadoEjercicio.insertId;

      // ============================================================
      // 4b. ITERAR Y INSERTAR LAS SERIES DE ESTE EJERCICIO
      // ============================================================
      for (const serie of ejercicio.series) {
        await connection.execute(
          `INSERT INTO sesion_series (sesion_ejercicio_id, numero_serie, repeticiones, peso, rpe)
           VALUES (?, ?, ?, ?, ?)`,
          [
            sesionEjercicioId,
            serie.numero_serie,
            serie.repeticiones,
            serie.peso || 0,
            serie.rpe || null,
          ]
        );
      }
    }

    // ============================================================
    // 5. CONFIRMAR LA TRANSACCIÓN (COMMIT)
    // ============================================================
    // Si llegamos acá sin errores, TODAS las inserciones se
    // guardan permanentemente en la base de datos.
    // Hasta que no se ejecuta COMMIT, nadie más puede ver
    // estos datos (ni siquiera otras conexiones del pool).
    await connection.commit();

    // Devolvemos el ID de la sesión creada para que el
    // controlador lo use en la respuesta
    return { sesionId };

  } catch (error) {
    // ============================================================
    // 6. SI ALGO FALLÓ: REVERTIR TODO (ROLLBACK)
    // ============================================================
    // Si ocurrió CUALQUIER error en cualquier paso (DB caída,
    // violación de FK, dato inválido, etc.), hacemos rollback
    // para deshacer TODO lo que se insertó en esta transacción.
    //
    // Es importante checkear que la conexión existe antes de
    // hacer rollback, porque el error podría haber ocurrido
    // antes de obtener la conexión.
    if (connection) {
      await connection.rollback();
    }

    // Relanzamos el error para que el controlador lo maneje
    throw error;

  } finally {
    // ============================================================
    // 7. LIBERAR LA CONEXIÓN SIEMPRE
    // ============================================================
    // finally se ejecuta TANTO si hubo éxito como si hubo error.
    // Esto garantiza que la conexión vuelva al pool SIEMPRE.
    //
    // Si no liberamos la conexión, eventualmente agotamos el
    // pool (connectionLimit: 10) y el servidor deja de responder.
    if (connection) {
      connection.release();
    }
  }
}

module.exports = { guardarSesionCompleta };
