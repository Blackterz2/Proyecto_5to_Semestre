// ============================================================
// RUTAS DE ESTADÍSTICAS - Récords Personales (PRs)
// ============================================================
// Tan delgada como las de sesión. Solo conecta GET /prs
// con el controlador.

const { Router } = require('express');
const { getPRs } = require('../controllers/estadisticasController');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = Router();

// GET /api/estadisticas/prs - Obtener récords personales del usuario
// 🔒 Protegida con JWT: devuelve SOLO los PRs del usuario del token
router.get('/prs', verificarToken, getPRs);

module.exports = router;
