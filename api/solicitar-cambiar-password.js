const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

function generarToken() {
  return crypto.randomBytes(32).toString("hex");
}



app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Ingresá tu email"
      });
    }

    const usuario = usuarios.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    // No revelar si el email existe
    if (!usuario) {
      return res.json({
        message: "Si el email está registrado, recibirás un enlace para recuperar tu contraseña."
      });
    }

    const token = generarToken();

    usuario.resetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    usuario.resetTokenExpires = Date.now() + 15 * 60 * 1000;

    await guardarUsuarios();

    const link =
      `${process.env.FRONTEND_URL}/restablecer-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: usuario.email,
      subject: "Recuperación de contraseña - Infanza",
      html: `
        <h2>Recuperar contraseña</h2>

        <p>Recibimos una solicitud para cambiar tu contraseña.</p>

        <p>
          <a href="${link}">
            Restablecer contraseña
          </a>
        </p>

        <p>Este enlace vence en 15 minutos.</p>

        <p>Si vos no solicitaste este cambio, podés ignorar este correo.</p>
      `
    });

    res.json({
      message: "Si el email está registrado, recibirás un enlace para recuperar tu contraseña."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Ocurrió un error"
    });
  }
});