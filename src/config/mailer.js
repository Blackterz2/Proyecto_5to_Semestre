// ============================================================
// CONFIGURACIÓN DE NODEMAILER — Envío de correos
// ============================================================
// Crea un transporte SMTP usando las credenciales del .env.
//
// Uso en otros archivos:
//   const transporter = require('../config/mailer');
//   await transporter.sendMail({ from, to, subject, html });

const nodemailer = require('nodemailer');

// Crear transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true para 465, false para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;
