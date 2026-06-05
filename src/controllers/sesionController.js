// ============================================================
// CONTROLADOR DE SESIÓN - Guardar entrenamientos completos
// ============================================================
// Recibe los datos de la sesión via POST, valida que estén
// completos, y se los pasa al modelo para que los guarde
// usando una transacción SQL.

const { guardarSesionCompleta } = require('../models/sesionModel');

// ============================================================
// crearSesion(req, res) - POST /api/sesiones
// ============================================================
async function crearSesion(req, res) {
  try {
    const datosSesion = req.body;

    // ============================================================
    // 1. VALIDACIÓN DE DATOS MÍNIMOS
    // ============================================================
    // Antes de tocar la base de datos, verificamos que el
    // cliente nos haya mandado TODO lo necesario.
    //
    // Si validamos acá, evitamos transacciones fallidas al
    // pedo. Una validación en JavaScript es instantánea,
    // una transacción fallida ya consumió recursos de MySQL.

    // ¿Vino el body?
    if (!datosSesion || typeof datosSesion !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'El cuerpo de la petición es requerido',
      });
    }

    // ¿Tiene usuario?
    if (!datosSesion.usuario_id) {
      return res.status(400).json({
        status: 'error',
        message: 'El campo usuario_id es requerido',
      });
    }

    // ¿Tiene rutina?
    if (!datosSesion.rutina_id) {
      return res.status(400).json({
        status: 'error',
        message: 'El campo rutina_id es requerido',
      });
    }

    // ¿Tiene fecha?
    if (!datosSesion.fecha) {
      return res.status(400).json({
        status: 'error',
        message: 'El campo fecha es requerido',
      });
    }

    // ¿Tiene ejercicios y es un array?
    if (!datosSesion.ejercicios || !Array.isArray(datosSesion.ejercicios) || datosSesion.ejercicios.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Debe incluir al menos un ejercicio en el array ejercicios',
      });
    }

    // Validar que cada ejercicio tenga series
    for (let i = 0; i < datosSesion.ejercicios.length; i++) {
      const ejercicio = datosSesion.ejercicios[i];

      if (!ejercicio.ejercicio_id) {
        return res.status(400).json({
          status: 'error',
          message: `El ejercicio en la posición ${i} debe tener un ejercicio_id`,
        });
      }

      if (!ejercicio.series || !Array.isArray(ejercicio.series) || ejercicio.series.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: `El ejercicio ${ejercicio.ejercicio_id} debe incluir al menos una serie`,
        });
      }
    }

    // ============================================================
    // 2. LLAMAR AL MODELO (GUARDAR CON TRANSACCIÓN)
    // ============================================================
    const resultado = await guardarSesionCompleta(datosSesion);

    // ============================================================
    // 3. RESPUESTA: 201 CREATED
    // ============================================================
    // 201 = "recurso creado exitosamente"
    // Es más específico que 200 (OK genérico).
    // La convención REST dice:
    //   - POST exitoso → 201 Created
    //   - GET exitoso   → 200 OK
    res.status(201).json({
      status: 'ok',
      message: 'Sesión guardada exitosamente',
      data: {
        sesionId: resultado.sesionId,
      },
    });

  } catch (error) {
    // ============================================================
    // 4. MANEJO DE ERRORES
    // ============================================================
    // Si el modelo lanzó un error (porque el rollback ya se
    // manejó allá), acá respondemos al cliente.
    console.error('Error al guardar sesión:', error.message);

    // Errores comunes:
    //   - "Cannot add or update a child row: a foreign key
    //     constraint fails" → el usuario_id o rutina_id no
    //     existen en sus tablas padre
    //   - "Table 'blackterz.sesiones_entrenamiento' doesn't
    //     exist" → todavía no creamos la tabla
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        status: 'error',
        message: 'Error de configuración: tabla no encontrada',
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'El usuario o la rutina especificada no existe',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

module.exports = { crearSesion };
