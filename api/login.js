import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      mensaje: "Método no permitido",
    });
  }

  const { usuario, password } = req.body;

  const adminUsuario = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsuario || !adminPassword) {
    return res.status(500).json({
      ok: false,
      mensaje: "El administrador no está configurado",
    });
  }

  const usuarioCorrecto =
    typeof usuario === "string" &&
    usuario === adminUsuario;

  const passwordCorrecta =
    typeof password === "string" &&
    password === adminPassword;

  if (!usuarioCorrecto || !passwordCorrecta) {
    return res.status(401).json({
      ok: false,
      mensaje: "Usuario o contraseña incorrectos",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  return res.status(200).json({
    ok: true,
    token,
  });
}