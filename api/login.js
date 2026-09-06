
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { download } from "@vercel/blob";
export default  async function handler(req, res) {
  // CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://lentes-mocha.vercel.app"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      mensaje: "Método no permitido",
    });
  }

  const { usuario, password } = req.body;

const blob = await download("usuarios/usuarios.json", {
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

const administradores = JSON.parse(await blob.text());

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      ok: false,
      mensaje: "JWT_SECRET no está configurado",
    });
  }

  const administrador = administradores.find(
    (admin) => admin.usuario === usuario
  );

  if (!administrador || !administrador.passwordHash) {
    return res.status(401).json({
      ok: false,
      mensaje: "Usuario o contraseña incorrectos",
    });
  }

  const passwordCorrecta = await bcrypt.compare(
    password,
    administrador.passwordHash
  );

  if (!passwordCorrecta) {
    return res.status(401).json({
      ok: false,
      mensaje: "Usuario o contraseña incorrectos",
    });
  }

  // Crear token firmado
  const token = jwt.sign(
    {
      rol: "admin",
      usuario: administrador.usuario,
    },
    jwtSecret,
    {
      expiresIn: "2h",
    }
  );

  return res.status(200).json({
    ok: true,
    token,
  });
}



