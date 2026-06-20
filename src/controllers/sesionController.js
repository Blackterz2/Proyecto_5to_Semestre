// ============================================================
// CONTROLADOR DE SESIÓN - Guardar entrenamientos completos
// ============================================================
// Recibe los datos de la sesión via POST, valida que estén
// completos, y se los pasa al modelo para que los guarde
// usando una transacción SQL.

const { guardarSesionCompleta, obtenerHistorialUsuario, obtenerUltimaSesionPorRutina, obtenerDetalleSesion } = require('../models/sesionModel');

// ============================================================
// crearSesion(req, res) - POST /api/sesiones
// ============================================================
async function crearSesion(req, res) {
  try {
    const datosSesion = req.body;

    // ============================================================
    // 1. EXTRAER USUARIO DEL TOKEN (NO del body)
    // ============================================================
    // ⚠️ SEGURIDAD: Esto es CRÍTICO. Nunca confíes en el
    //    usuario_id que viene en el body de la request.
    //
    // ¿QUÉ ES EL ID SPOOFING?
    // -----------------------
    // Si el controlador usara req.body.usuario_id, un atacante
    // podría interceptar la petición y CAMBIAR el usuario_id
    // para crear sesiones en nombre de OTRO usuario.
    //
    // Ejemplo de ataque:
    //   Body original:  { usuario_id: 1, ejercicios: [...] }
    //   Body modificado: { usuario_id: 999, ejercicios: [...] }
    //   → Sin protección, la sesión se crea para el usuario 999
    //
    // Al leer el usuario_id del JWT (req.usuario.usuario_id),
    // nos aseguramos de que:
    //   1. El usuario está autenticado (el middleware ya verificó
    //      el token antes de llegar acá).
    //   2. El ID es AUTÉNTICO — está firmado por el servidor
    //      y no puede ser modificado por el cliente.
    //   3. Ignoramos cualquier usuario_id que venga en el body.
    //
    // req.usuario es inyectado por authMiddleware.verificarToken()
    // y contiene el payload decodificado del JWT:
    //   { usuario_id: 1, iat: ..., exp: ... }
    const usuario_id = req.usuario.usuario_id;

    // ============================================================
    // 2. VALIDACIÓN DE DATOS MÍNIMOS
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
    // 3. ASIGNAR USUARIO REAL (DESDE JWT) Y LLAMAR AL MODELO
    // ============================================================
    // Sobreescribimos datosSesion.usuario_id con el ID real
    // que viene del token. El modelo lee datosSesion.usuario_id
    // así que si el cliente mandó un usuario_id DISTINTO en
    // el body, queda pisado por el verdadero.
    //
    // Esto es la defensa contra ID Spoofing: el modelo NUNCA
    // ve el usuario_id que mandó el cliente, SOLO el del JWT.
    datosSesion.usuario_id = usuario_id;
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

// ============================================================
// getHistorial(req, res) - GET /api/sesiones
// ============================================================
// Devuelve el historial de entrenamientos del usuario autenticado.
//
// FLUJO:
//   1. req.usuario.usuario_id viene del JWT (authMiddleware ya
//      verificó el token antes de llegar acá).
//   2. Llamamos al modelo que ejecuta un SELECT con JOIN.
//   3. Devolvemos el array de sesiones.
//
// SEGURIDAD:
//   - usuario_id viene del JWT, NO de un parámetro de URL ni del body.
//   - Es IMPOSIBLE que un usuario vea el historial de otro aunque
//     modifique la request, porque el ID es el del token firmado.
async function getHistorial(req, res) {
  try {
    const usuario_id = req.usuario.usuario_id;
    const historial = await obtenerHistorialUsuario(usuario_id);

    res.status(200).json({
      status: 'ok',
      data: historial,
    });

  } catch (error) {
    console.error('Error al obtener historial:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el historial',
    });
  }
}

// ============================================================
// getUltimaSesion(req, res) - GET /api/sesiones/ultima/:rutina_id
// ============================================================
// Devuelve la última sesión de entrenamiento del usuario para
// una rutina específica, con las series agrupadas por ejercicio.
//
// SEGURIDAD:
//   - usuario_id viene del JWT (req.usuario.usuario_id)
//   - El parámetro rutina_id se valida que sea numérico
//
// RESPUESTAS:
//   200: { status: 'ok', data: { sesionId, ejercicios } }
//   200: { status: 'ok', data: null, message: '...' } si no hay historial
//   400: { status: 'error', message: 'ID de rutina inválido' }
//   500: { status: 'error', message: 'Error al obtener la última sesión' }
async function getUltimaSesion(req, res) {
  try {
    const usuarioId = req.usuario.usuario_id;
    const rutinaId = Number(req.params.rutina_id);

    if (isNaN(rutinaId)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de rutina inválido',
      });
    }

    const resultado = await obtenerUltimaSesionPorRutina(rutinaId, usuarioId);

    if (!resultado) {
      return res.json({
        status: 'ok',
        data: null,
        message: 'No hay sesiones anteriores para esta rutina',
      });
    }

    res.json({
      status: 'ok',
      data: resultado,
    });

  } catch (error) {
    console.error('Error al obtener última sesión:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener la última sesión',
    });
  }
}

// ============================================================
// getDetalleSesion(req, res) - GET /api/sesiones/:id
// ============================================================
// Devuelve el detalle completo de una sesión (ejercicios + series).
//
// SEGURIDAD:
//   - usuario_id viene del JWT (req.usuario.usuario_id)
//   - Si la sesión pertenece a otro usuario → 404 (no revelamos que existe)
async function getDetalleSesion(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuario_id;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ ok: false, mensaje: 'ID de sesión inválido' });
    }

    const detalle = await obtenerDetalleSesion(Number(id), usuarioId);

    if (!detalle) {
      return res.status(404).json({ ok: false, mensaje: 'Sesión no encontrada' });
    }

    res.json({ ok: true, data: detalle });
  } catch (error) {
    console.error('Error al obtener detalle de sesión:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener el detalle de la sesión' });
  }
}

module.exports = { crearSesion, getHistorial, getUltimaSesion, getDetalleSesion };
