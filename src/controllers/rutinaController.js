// ============================================================
// CONTROLADOR DE RUTINA - Capa de lógica de la aplicación
// ============================================================
// Esta capa es la que ORQUESTA. Recibe la request HTTP, llama
// al modelo para obtener datos, y arma la respuesta HTTP.
//
// ⚠️ NO sabe nada de SQL. No sabe cómo se conecta a la DB.
//    Solo sabe de req, res, y códigos HTTP.
//
// ¿Por qué separar controlador de modelo?
//   - El controlador se ocupa de HTTP (status codes, headers).
//   - El modelo se ocupa de datos (SQL, filtros, joins).
//   - Si cambia la lógica de negocio, tocás el controlador.
//   - Si cambia el motor de DB, tocás el modelo.
//   - Si cambian ambos, algo está mal diseñado.

// Importamos el modelo. Notá que importamos UNA FUNCIÓN
// específica, no todo el modelo. Claridad ante todo.
const { obtenerRutinaConEjercicios, contarRutinasUsuario, insertarRutina, obtenerRutinasPorUsuario, insertarEjerciciosEnRutina, desactivarRutina } = require('../models/rutinaModel');

// ============================================================
// getRutina(req, res) - GET /api/rutinas/:id
// ============================================================
// async: porque vamos a esperar (await) al modelo que a su
// vez espera a la DB. Todo async es una cadena.
async function getRutina(req, res) {
  try {
    // ============================================================
    // 1. LEER EL PARÁMETRO DE LA URL
    // ============================================================
    // req.params.id viene de la ruta GET /:id.
    // Express convierte automáticamente el segmento de la URL
    // en req.params.
    //
    // Por ejemplo:
    //   GET /api/rutinas/42  →  req.params.id = "42"
    //   GET /api/rutinas/abc →  req.params.id = "abc"
    //
    // Convertimos a número con Number() para estar seguros.
    // Si no se puede convertir, Number() devuelve NaN.
    const rutinaId = Number(req.params.id);

    // ============================================================
    // 2. VALIDAR QUE EL ID SEA VÁLIDO
    // ============================================================
    // Si no es un número, devolvemos 400 Bad Request.
    // Esto evita que le mandemos un NaN a la DB.
    if (isNaN(rutinaId)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID de la rutina debe ser un número válido',
      });
    }

    // ============================================================
    // 3. LLAMAR AL MODELO (ACÁ OCURRE LA MAGIA)
    // ============================================================
    // El controlador NO SABE qué SQL se ejecuta. Solo sabe
    // que si le pasa un ID, recibe una rutina con ejercicios.
    const rutina = await obtenerRutinaConEjercicios(rutinaId);

    // ============================================================
    // 4. VERIFICAR SI LA RUTINA EXISTE
    // ============================================================
    // El modelo devuelve null si no encontró la rutina.
    if (!rutina) {
      return res.status(404).json({
        status: 'error',
        message: `No se encontró la rutina con ID ${rutinaId}`,
      });
    }

    // ============================================================
    // 5. DEVOLVER LA RESPUESTA
    // ============================================================
    // Código 200 (default en Express con res.json()) y los
    // datos de la rutina en el body.
    res.json({
      status: 'ok',
      data: rutina,
    });
  } catch (error) {
    // ============================================================
    // 6. MANEJO DE ERRORES
    // ============================================================
    // Si algo falla en el modelo (DB caída, query mal escrita,
    // etc.), el error se captura acá.
    //
    // Log del error en el servidor para debugging.
    console.error('Error al obtener rutina:', error.message);

    // Respuesta genérica al cliente. Nunca le mandes el error
    // real al cliente en producción (puede exponer información
    // de la DB como nombres de tablas o columnas).
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

// ============================================================
// crearRutina(req, res) - POST /api/rutinas/crear
// ============================================================
// Crea una nueva rutina para el usuario autenticado.
//
// ⚠️ SEGURIDAD: El usuario_id se extrae EXCLUSIVAMENTE del
//    token JWT (req.usuario.usuario_id). NO del body.
//
// ¿POR QUÉ ES IMPORTANTE?
// -----------------------
// Si usáramos req.body.usuario_id, un atacante podría crear
// rutinas en nombre de OTRO usuario con solo cambiar el ID
// en el body. Eso se llama ID SPOOFING.
//
// Al leer el ID del JWT:
//   1. El usuario está autenticado (el middleware ya verificó
//      el token).
//   2. El ID es AUTÉNTICO (está firmado por el servidor).
//   3. Ignoramos CUALQUIER usuario_id que venga en el body.
//
// LÍMITE GRATUITO (REGLAS DE NEGOCIO):
//   - Un usuario puede tener HASTA 4 rutinas.
//   - Si ya tiene 4, responde con 403 Forbidden.
//   - El conteo se hace en CADA request de creación.
//
// ¿Por qué contar en cada request?
//   Porque entre que el frontend muestra el botón y el usuario
//   hace clic, otro proceso (o pestaña) podría haber creado
//   una rutina. Contar al momento de crear evita race conditions.
async function crearRutina(req, res) {
  try {
    // ============================================================
    // 1. EXTRAER USUARIO DEL TOKEN (NUNCA del body)
    // ============================================================
    const usuario_id = req.usuario.usuario_id;

    // ============================================================
    // 2. EXTRAER CAMPOS DEL BODY
    // ============================================================
    // ejercicios_ids es OPCIONAL. Si viene, debe ser un array.
    const { nombre, descripcion, ejercicios_ids } = req.body;

    // ============================================================
    // 3. VALIDAR DATOS MÍNIMOS
    // ============================================================
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El nombre de la rutina es obligatorio',
      });
    }

    // ============================================================
    // 4. VERIFICAR LÍMITE GRATUITO (MÁXIMO 4 RUTINAS)
    // ============================================================
    // Contamos cuántas rutinas tiene el usuario actualmente.
    // Si ya llegó al límite, rechazamos la creación.
    const total = await contarRutinasUsuario(usuario_id);

    if (total >= 4) {
      return res.status(403).json({
        status: 'error',
        message: 'Has alcanzado el límite de 4 rutinas personalizadas.',
      });
    }

    // ============================================================
    // 4. INSERTAR LA RUTINA
    // ============================================================
    const rutina = await insertarRutina(
      usuario_id,
      nombre.trim(),
      descripcion ? descripcion.trim() : null
    );

    // ============================================================
    // 5. ASIGNAR EJERCICIOS (SI VIERON EN EL BODY)
    // ============================================================
    // ejercicios_ids es un array opcional. Si está presente,
    // insertamos las filas en ejercicios_rutinas con orden
    // automático incremental.
    //
    // Validación: debe ser un array con al menos un ID numérico.
    if (ejercicios_ids && Array.isArray(ejercicios_ids) && ejercicios_ids.length > 0) {
      // Filtramos solo IDs numéricos válidos para prevenir inyección
      const idsValidos = ejercicios_ids.filter(id => Number.isFinite(Number(id)));
      if (idsValidos.length > 0) {
        await insertarEjerciciosEnRutina(rutina.id, idsValidos);
      }
    }

    // ============================================================
    // 6. RESPONDER CON 201 CREATED
    // ============================================================
    res.status(201).json({
      status: 'ok',
      message: 'Rutina creada exitosamente',
      data: rutina,
    });

  } catch (error) {
    console.error('Error al crear rutina:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

// ============================================================
// getRutinasDelUsuario(req, res) - GET /api/rutinas/
// ============================================================
// Devuelve TODAS las rutinas del usuario autenticado (sin
// ejercicios — solo el listado para el dashboard).
//
// El usuario_id se extrae del JWT como siempre.
async function getRutinasDelUsuario(req, res) {
  try {
    const usuario_id = req.usuario.usuario_id;
    const rutinas = await obtenerRutinasPorUsuario(usuario_id);

    res.json({
      status: 'ok',
      data: rutinas,
    });
  } catch (error) {
    console.error('Error al listar rutinas:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener las rutinas',
    });
  }
}

// ============================================================
// eliminarRutina(req, res) - DELETE /api/rutinas/:id
// ============================================================
// Marca la rutina como inactiva (borrado lógico) para el
// usuario autenticado. No la borra físicamente para conservar
// el historial de entrenamientos.
async function eliminarRutina(req, res) {
  try {
    const rutinaId = Number(req.params.id);

    // Validar que el ID sea un número válido
    if (isNaN(rutinaId)) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID de la rutina debe ser un número válido',
      });
    }

    const affectedRows = await desactivarRutina(rutinaId, req.usuario.usuario_id);

    if (affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Rutina no encontrada',
      });
    }

    res.json({
      status: 'ok',
      message: 'Rutina desactivada correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar rutina:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

// Exportamos las funciones para que la ruta las use
module.exports = { getRutina, crearRutina, getRutinasDelUsuario, eliminarRutina };
