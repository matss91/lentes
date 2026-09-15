const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");




app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Datos incompletos"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 8 caracteres"
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const usuario = usuarios.find(
      u =>
        u.resetToken === tokenHash &&
        u.resetTokenExpires > Date.now()
    );

    if (!usuario) {
      return res.status(400).json({
        message: "El enlace no es válido o ya venció"
      });
    }

    usuario.password = await bcrypt.hash(password, 12);

    delete usuario.resetToken;
    delete usuario.resetTokenExpires;

    await guardarUsuarios();

    res.json({
      message: "Contraseña actualizada correctamente"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Ocurrió un error"
    });
  }
});