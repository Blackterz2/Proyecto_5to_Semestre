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
const { obtenerRutinaConEjercicios } = require('../models/rutinaModel');

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

// Exportamos la función para que la ruta la use
module.exports = { getRutina };
