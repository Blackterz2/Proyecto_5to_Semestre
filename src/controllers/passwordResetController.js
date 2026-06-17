// ============================================================
// CONTROLADOR DE RESETEO DE CONTRASEÑA (F2 Hito 3)
// ============================================================
// Endpoints públicos (sin verificarToken):
//   POST /api/auth/forgot-password  → solicitarReset
//   POST /api/auth/reset-password   → resetearPassword
//
// FLUJO COMPLETO:
//   1. Usuario ingresa email en /forgot-password.html
//   2. Se genera un token de 64 caracteres hex (crypto.randomBytes)
//   3. Se guarda en password_resets con expiración de 1 hora
//   4. Se envía un email con el link de reseteo
//   5. Usuario hace clic en el link → /reset-password.html?token=...
//   6. Ingresa nueva contraseña → se valida, hashea y actualiza
//   7. Token se marca como usado (no reutilizable)

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { buscarUsuarioPorEmail } = require('../models/authModel');
const { guardarToken, buscarToken, marcarTokenUsado } = require('../models/passwordResetModel');
const { cambiarContrasena } = require('../models/usuarioModel');
const transporter = require('../config/mailer');

// ============================================================
// solicitarReset(req, res) - POST /api/auth/forgot-password
// ============================================================
// Recibe { email }, genera un token, lo guarda y envía el
// email. NUNCA revela si el email existe o no (seguridad).
async function solicitarReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El email es obligatorio',
      });
    }

    // Buscar usuario — NO revelar si existe o no
    const usuario = await buscarUsuarioPorEmail(email);

    if (usuario && usuario.activo) {
      // Generar token seguro de 64 caracteres hex
      const token = crypto.randomBytes(32).toString('hex');

      // Expira en 1 hora
      const expiraEn = new Date(Date.now() + 60 * 60 * 1000);

      await guardarToken(usuario.id, token, expiraEn);

      // Construir link de reseteo
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const resetLink = `${appUrl}/reset-password.html?token=${token}`;

      // Enviar email
      const from = process.env.EMAIL_USER || 'noreply@fitnessapp.com';

      await transporter.sendMail({
        from,
        to: usuario.email,
        subject: 'Recuperá tu contraseña — FitnessApp',
        html: `
          <div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;background:#1a1a2e;padding:32px;border-radius:12px;color:#e0e0e0;">
            <h1 style="color:#e94560;margin:0 0 16px;">🏋️ Blackterz</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
              Recibimos una solicitud para restablecer tu contraseña.
              Hacé clic en el botón de abajo para crear una nueva.
            </p>
            <a href="${resetLink}"
               style="display:inline-block;background:#e94560;color:#fff;text-decoration:none;
                      padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;">
              Restablecer contraseña
            </a>
            <p style="margin:24px 0 0;font-size:13px;color:#888;">
              Este enlace expira en 1 hora. Si no solicitaste este cambio, ignorá este correo.
            </p>
          </div>
        `,
      });
    }

    // Siempre responder igual, exista o no el email
    res.json({
      ok: true,
      mensaje: 'Si el email existe, recibirás un correo con las instrucciones',
    });

  } catch (error) {
    console.error('Error en solicitarReset:', error.message);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
    });
  }
}

// ============================================================
// resetearPassword(req, res) - POST /api/auth/reset-password
// ============================================================
// Recibe { token, passwordNueva }, valida, hashea y actualiza.
async function resetearPassword(req, res) {
  try {
    const { token, passwordNueva } = req.body;

    // ============================================================
    // VALIDACIONES
    // ============================================================
    if (!token || !passwordNueva) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Token y nueva contraseña son obligatorios',
      });
    }

    if (passwordNueva.length < 8) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La nueva contraseña debe tener al menos 8 caracteres',
      });
    }

    // ============================================================
    // VERIFICAR TOKEN
    // ============================================================
    const resetData = await buscarToken(token);

    if (!resetData) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El enlace es inválido o ya expiró',
      });
    }

    // ============================================================
    // ACTUALIZAR CONTRASEÑA
    // ============================================================
    const saltRounds = 10;
    const hashNueva = await bcrypt.hash(passwordNueva, saltRounds);

    await cambiarContrasena(resetData.usuario_id, hashNueva);

    // Marcar token como usado (no reutilizable)
    await marcarTokenUsado(token);

    res.json({
      ok: true,
      mensaje: 'Contraseña actualizada. Ya podés iniciar sesión',
    });

  } catch (error) {
    console.error('Error en resetearPassword:', error.message);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
    });
  }
}

module.exports = { solicitarReset, resetearPassword };
