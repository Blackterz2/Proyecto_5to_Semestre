// ============================================================
// CONTROLADOR DE AUTENTICACIÓN - Registro y Login
// ============================================================
// Este controlador maneja las operaciones de auth:
//   POST /api/auth/register
//   POST /api/auth/login
//
// FLUJO DE REGISTRO:
//   1. Validar datos mínimos
//   2. Verificar que el email no exista
//   3. Hashear la contraseña con bcrypt
//   4. Guardar el usuario con el hash
//   5. Responder 201 Created
//
// FLUJO DE LOGIN:
//   1. Validar datos mínimos
//   2. Buscar usuario por email
//   3. Comparar contraseña con bcrypt.compare()
//   4. Generar JWT con el usuario_id
//   5. Responder con el token

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { crearUsuario, buscarUsuarioPorEmail } = require('../models/authModel');

// ============================================================
// register(req, res) - POST /api/auth/register
// ============================================================
async function register(req, res) {
  try {
    const { nombre, email, password } = req.body;

    // ============================================================
    // 1. VALIDACIÓN DE DATOS
    // ============================================================
    if (!nombre || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Los campos nombre, email y password son requeridos',
      });
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Formato de email inválido',
      });
    }

    // La contraseña debe tener al menos 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // ============================================================
    // 2. VERIFICAR QUE EL EMAIL NO EXISTA
    // ============================================================
    const usuarioExistente = await buscarUsuarioPorEmail(email);
    if (usuarioExistente) {
      return res.status(409).json({
        status: 'error',
        message: 'El email ya está registrado',
      });
    }

    // ============================================================
    // 3. HASHEAR LA CONTRASEÑA CON BCRYPT
    // ============================================================
    // ¿QUÉ ES UN SALT?
    // -----------------
    // Un "salt" es una cadena aleatoria que se agrega a la
    // contraseña ANTES de hashearla. Así, dos usuarios con
    // la misma contraseña ("123456") generan hashes DISTINTOS.
    //
    // Sin salt:  hash("123456") → "ac9689e8..." (siempre igual)
    // Con salt:  hash("123456" + "aB3x...") → "8f3a2b..." (distinto)
    //
    // ¿Por qué 10 ROUNDS?
    // -------------------
    // bcrypt.hash() ejecuta el algoritmo 2^saltRounds veces.
    //   10 rounds = 2^10 = 1024 iteraciones
    //   12 rounds = 4096 iteraciones
    //   14 rounds = 16384 iteraciones
    //
    // Más rounds = más seguro pero más lento.
    // 10 es el balance ideal: tarda ~100ms, suficiente para
    // hacer inviable un ataque de fuerza bruta.
    //
    // El resultado incluye: algoritmo + salt + hash
    //   $2b$10$[22 chars de salt][31 chars de hash]
    //   ↑       ↑
    //   bcrypt  10 rounds
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // ============================================================
    // 4. GUARDAR EL USUARIO
    // ============================================================
    const nuevoUsuario = await crearUsuario(nombre, email, passwordHash);

    // ============================================================
    // 5. RESPONDER 201 CREATED
    // ============================================================
    res.status(201).json({
      status: 'ok',
      message: 'Usuario registrado exitosamente',
      data: {
        id:     nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email:  nuevoUsuario.email,
      },
    });

  } catch (error) {
    console.error('Error en registro:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

// ============================================================
// login(req, res) - POST /api/auth/login
// ============================================================
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // ============================================================
    // 1. VALIDACIÓN DE DATOS
    // ============================================================
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Los campos email y password son requeridos',
      });
    }

    // ============================================================
    // 2. BUSCAR USUARIO POR EMAIL
    // ============================================================
    const usuario = await buscarUsuarioPorEmail(email);

    if (!usuario) {
      // No decimos "el usuario no existe" por seguridad.
      // Un atacante podría probar emails para ver cuáles
      // están registrados. Decimos "credenciales inválidas".
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas',
      });
    }

    // ============================================================
    // 2.5 VERIFICAR QUE LA CUENTA ESTÉ ACTIVA (Hito 12.6)
    // ============================================================
    // Soft delete: si activo = FALSE, el usuario no puede
    // iniciar sesión aunque tenga credenciales válidas.
    //
    // ¿Por qué 403 y no 401?
    //   401 = "no estás autenticado" (credenciales faltantes/inválidas)
    //   403 = "estás autenticado pero no tenés permiso"
    //   En este caso el usuario EXISTE, su contraseña es correcta,
    //   pero su cuenta está desactivada → 403 Forbidden.
    if (!usuario.activo) {
      return res.status(403).json({
        status: 'error',
        message: 'Esta cuenta ha sido desactivada',
      });
    }

    // ============================================================
    // 3. COMPARAR CONTRASEÑA CON BCRYPT
    // ============================================================
    // bcrypt.compare() toma la contraseña en texto plano y
    // el hash almacenado, extrae el salt del hash, lo aplica
    // a la contraseña, y compara el resultado con el hash.
    //
    // Internamente hace:
    //   1. Toma el hash: $2b$10$SaLt...Hash...
    //   2. Extrae el salt: $2b$10$SaLt...
    //   3. Hashea la password ingresada con ESE mismo salt
    //   4. Compara: hash(ingresada) === hash(almacenado)
    //
    // Si devuelve false, la contraseña es incorrecta.
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas',
      });
    }

    // ============================================================
    // 4. GENERAR JWT (JSON WEB TOKEN)
    // ============================================================
    // ¿CÓMO FUNCIONA UN JWT?
    // -----------------------
    // Un JWT tiene 3 partes separadas por puntos:
    //
    //   HEADER.PAYLOAD.SIGNATURE
    //
    // 1. HEADER: { "alg": "HS256", "typ": "JWT" }
    //    → Algoritmo de firma y tipo de token
    //
    // 2. PAYLOAD: { "usuario_id": 1, "iat": 1680000000, "exp": 1680604800 }
    //    → Los DATOS que viajan dentro del token (claims)
    //    → iat = issued at (emitido en)
    //    → exp = expiration (expira en)
    //
    // 3. SIGNATURE: HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)
    //    → La FIRMA digital que garantiza que NADIE modificó
    //      el payload. Si alguien cambia usuario_id, la firma
    //      no coincide y jwt.verify() tira error.
    //
    // El PAYLOAD se ve en BASE64 (no está encriptado, solo
    // codificado). Cualquiera puede decodificarlo:
    //   https://jwt.io/
    //
    // Lo que hace SEGURO al JWT es la FIRMA, no el payload.
    // Datos sensibles (como passwords) NUNCA van en el payload.
    const payload = {
      usuario_id: usuario.id,
      nombre:     usuario.nombre,
      email:      usuario.email,
    };

    const secret = process.env.JWT_SECRET;

    // Si no hay JWT_SECRET configurado, no podemos firmar tokens
    if (!secret || secret === 'mi_clave_secreta_cambiame_en_produccion') {
      console.error('⚠️ JWT_SECRET no configurado en .env');
      return res.status(500).json({
        status: 'error',
        message: 'Error de configuración del servidor',
      });
    }

    // Firmamos el token con expiración de 7 días
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    // ============================================================
    // 5. RESPONDER CON EL TOKEN
    // ============================================================
    res.json({
      status: 'ok',
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: {
          id:     usuario.id,
          nombre: usuario.nombre,
          email:  usuario.email,
        },
      },
    });

  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
}

module.exports = { register, login };
