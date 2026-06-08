// ============================================================
// CONTROLADOR DE EJERCICIO - Capa de lógica HTTP
// ============================================================
// Recibe las requests HTTP, llama al modelo, y arma la respuesta.
//
// ⚠️ NO sabe nada de SQL. Solo sabe de req, res, y códigos HTTP.

const { obtenerTodos } = require('../models/ejercicioModel');

// ============================================================
// getEjercicios(req, res) - GET /api/ejercicios
// ============================================================
// Devuelve la lista completa de ejercicios del catálogo.
//
// 🔒 Protegida con JWT (el middleware verificarToken se encarga
//    en la ruta). Acá solo respondemos.
async function getEjercicios(req, res) {
  try {
    const ejercicios = await obtenerTodos();

    res.json({
      status: 'ok',
      data: ejercicios,
    });
  } catch (error) {
    console.error('Error al obtener ejercicios:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

module.exports = { getEjercicios };
