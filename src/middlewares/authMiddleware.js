// ============================================================
// MIDDLEWARE DE AUTENTICACIÓN - Verificación de JWT
// ============================================================
// Un middleware en Express es una función que se ejecuta
// ANTES de llegar al controlador. Puede:
//   1. Modificar req/res
//   2. Dejar pasar la request (llamando a next())
//   3. Cortar la request (respondiendo con error)
//
// Este middleware verifica que el cliente tenga un JWT
// válido en el header Authorization. Si es válido, deja
// pasar la request. Si no, responde con 401.

const jwt = require('jsonwebtoken');

// ============================================================
// verificarToken(req, res, next)
// ============================================================
// Extrae el token del header, lo verifica y, si es válido,
// guarda los datos del usuario en req.usuario para que
// los controladores posteriores lo usen.
//
// ¿CÓMO ENVÍA EL CLIENTE EL TOKEN?
// ---------------------------------
// El cliente debe incluir el token en el header:
//
//   Authorization: Bearer <token>
//
// El prefijo "Bearer" (portador) es el estándar HTTP para
// tokens de acceso. El middleware saca el token de ahí.
function verificarToken(req, res, next) {
  try {
    // ============================================================
    // 1. OBTENER EL HEADER AUTHORIZATION
    // ============================================================
    const authHeader = req.headers.authorization;

    // Si no hay header, el cliente no está autenticado
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de acceso requerido',
      });
    }

    // ============================================================
    // 2. EXTRAER EL TOKEN (sin el prefijo "Bearer ")
    // ============================================================
    // El header viene como: "Bearer eyJhbGciOiJIUzI1NiIs..."
    // Partimos por el espacio y tomamos la segunda parte.
    const partes = authHeader.split(' ');

    // Si no tiene exactamente 2 partes o no arranca con
    // "Bearer", el formato es inválido
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
      return res.status(401).json({
        status: 'error',
        message: 'Formato de token inválido. Usar: Bearer <token>',
      });
    }

    const token = partes[1];

    // ============================================================
    // 3. VERIFICAR EL TOKEN CON jwt.verify
    // ============================================================
    // jwt.verify(token, secret) hace 3 cosas:
    //   1. Verifica la FIRMA digital (que el token no fue
    //      modificado desde que se emitió).
    //   2. Verifica la EXPIRACIÓN (que el token no haya
    //      vencido). Si expiró, lanza error.
    //   3. Decodifica el PAYLOAD y lo devuelve.
    //
    // Si algo falla (firma inválida, token expirado, etc.),
    // tira una excepción que capturamos en el catch.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ============================================================
    // 4. GUARDAR EL USUARIO EN LA REQUEST
    // ============================================================
    // El payload del JWT contiene { usuario_id: 1, iat: ..., exp: ... }
    // Guardamos los datos en req.usuario para que cualquier
    // controlador que ejecute después pueda acceder a ellos.
    //
    // Ejemplo de uso en un controlador:
    //   req.usuario.usuario_id → el ID del usuario autenticado
    req.usuario = decoded;

    // ============================================================
    // 5. PASAR AL SIGUIENTE MIDDLEWARE/CONTROLADOR
    // ============================================================
    // next() le dice a Express: "todo bien, que siga el
    // flujo normal". Sin next(), la request se cuelga.
    next();

  } catch (error) {
    // ============================================================
    // 6. ERRORES COMUNES DE JWT
    // ============================================================
    // TokenExpiredError: el token venció (exp > 7 días)
    // JsonWebTokenError: la firma no coincide (token manipulado)
    // NotBeforeError:   el token aún no es válido
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expirado. Iniciá sesión nuevamente',
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Token inválido',
    });
  }
}

module.exports = { verificarToken };
