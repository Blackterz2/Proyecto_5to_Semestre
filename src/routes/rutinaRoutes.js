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
const { getRutina, crearRutina, getRutinasDelUsuario, eliminarRutina, putRutina } = require('../controllers/rutinaController');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = Router();

// ============================================================
// GET / - Listar todas las rutinas del usuario autenticado
// ============================================================
// 🔒 Protegida con JWT: devuelve SOLO las rutinas del usuario
// del token. Cada rutina incluye id, nombre y total de ejercicios.
router.get('/', verificarToken, getRutinasDelUsuario);

// ============================================================
// POST /crear - Crear una nueva rutina personalizada
// ============================================================
// 🔒 Protegida con JWT: solo usuarios autenticados pueden crear rutinas
//
// El usuario_id se extrae del TOKEN, no del body (anti-spoofing).
// Si el usuario ya tiene 4 rutinas, responde con 403 Forbidden.
//
// Body esperado: { nombre: "Full Body", descripcion: "..." }
router.post('/crear', verificarToken, crearRutina);

// ============================================================
// GET /:id - Obtener una rutina con sus ejercicios
// ============================================================
// 🔒 Protegida con JWT: solo usuarios autenticados pueden ver rutinas
//
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
router.get('/:id', verificarToken, getRutina);

// ============================================================
// DELETE /:id - Desactivar (borrado lógico) una rutina
// ============================================================
// 🔒 Protegida con JWT: solo el dueño puede desactivar su rutina.
//
// No borra la rutina de la BD, solo marca activa = FALSE para
// conservar el historial de entrenamientos.
router.delete('/:id', verificarToken, eliminarRutina);

// ============================================================
// PUT /:id - Actualizar una rutina existente
// ============================================================
// 🔒 Protegida con JWT: solo el dueño puede modificar su rutina.
//
// Body esperado:
//   { nombre: "Full Body", descripcion: "...", ejercicios_ids: [1,5,3] }
//
// NOTA: ejercicios_ids REEMPLAZA todos los ejercicios actuales.
// NO es un parche — si mandás [1,5,3], la rutina termina con
// exactamente esos 3 ejercicios en ese orden.
router.put('/:id', verificarToken, putRutina);

module.exports = router;
