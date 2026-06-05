// ============================================================
// RUTAS DE RUTINA - Capa de enrutamiento
// ============================================================
// Esta capa es la más DELGADA de todas. Su único trabajo es
// mapear VERBOS + URLS a CONTROLADORES.
//
// ⚠️ NO tiene lógica. No ejecuta SQL. No arma respuestas.
//    Solo dice: "Cuando alguien haga GET /:id, ejecutá
//    tal función del controlador".
//
// ¿Por qué separar rutas de controladores?
//   - Si tenés 1 ruta, parece al pedo. Pero cuando tengas
//     GET, POST, PUT, DELETE para el mismo recurso, tener
//     todo en un archivo de rutas ordenado es clave.
//   - Las rutas se leen de arriba a abajo y sabés TERMINANTE
//     qué URL ejecuta qué función. Sin sorpresas.

const { Router } = require('express');
const { getRutina } = require('../controllers/rutinaController');

const router = Router();

// ============================================================
// GET /:id - Obtener una rutina con sus ejercicios
// ============================================================
// :id es un parámetro DINÁMICO de la URL. Express captura
// cualquier valor que venga en esa posición y lo pone en
// req.params.id.
//
// Ejemplos:
//   GET /1     → req.params.id = "1"
//   GET /42    → req.params.id = "42"
//   GET /abc   → req.params.id = "abc"
//
// El controlador se encarga de validar que sea un número.
// El router SOLO enruta.
router.get('/:id', getRutina);

module.exports = router;
