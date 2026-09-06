
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { get } from "@vercel/blob";
export default async function handler(req, res) {
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

 const resultado = await get("usuarios/usuarios.json", {
  access: "private",
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

if (!resultado || !resultado.stream) {
  return res.status(500).json({
    ok: false,
    mensaje: "No se pudo leer usuarios.json",
  });
}

const texto = await new Response(resultado.stream).text();
const administradores = JSON.parse(texto);


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

