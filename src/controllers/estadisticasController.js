// ============================================================
// CONTROLADOR DE ESTADÍSTICAS - Récords Personales (PRs)
// ============================================================
// Capa de control para el endpoint GET /api/estadisticas/prs.
// Extrae el usuario_id del JWT y delega la consulta al modelo.

const { obtenerPRs } = require('../models/estadisticasModel');

// ============================================================
// getPRs(req, res) - GET /api/estadisticas/prs
// ============================================================
// Devuelve los récords personales del usuario autenticado:
// peso máximo histórico por ejercicio.
//
// EJEMPLO DE RESPUESTA:
//   {
//     status: 'ok',
//     data: [
//       { ejercicio_id: 3, ejercicio_nombre: 'Peso muerto', peso_maximo: 100, ... }
//     ]
//   }
//
// Si el usuario no tiene sesiones, devuelve un array vacío.
async function getPRs(req, res) {
  try {
    const usuario_id = req.usuario.usuario_id;
    const prs = await obtenerPRs(usuario_id);

    res.status(200).json({
      status: 'ok',
      data: prs,
    });

  } catch (error) {
    console.error('Error al obtener PRs:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener los récords personales',
    });
  }
}

module.exports = { getPRs };
