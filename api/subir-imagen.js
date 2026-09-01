import jwt from "jsonwebtoken";
import { put } from "@vercel/blob";

function verificarToken(req) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return null;
  }

  const token = auth.split(" ")[1];

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

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
    "Content-Type, Authorization"
  );

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      mensaje: "Método no permitido",
    });
  }

  // Verificar administrador
  const usuario = verificarToken(req);

  if (!usuario || usuario.rol !== "admin") {
    return res.status(401).json({
      ok: false,
      mensaje: "No autorizado",
    });
  }

  try {
    const { imagen, nombreArchivo, tipo } = req.body;

    if (!imagen || !nombreArchivo || !tipo) {
      return res.status(400).json({
        ok: false,
        mensaje: "Faltan datos de la imagen",
      });
    }

    // Convertir Base64 a Buffer
    const base64Data = imagen.split(",")[1];

    if (!base64Data) {
      return res.status(400).json({
        ok: false,
        mensaje: "Imagen inválida",
      });
    }

    const buffer = Buffer.from(base64Data, "base64");

    const nombreSeguro = nombreArchivo
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const ruta = `imagenes/${Date.now()}-${nombreSeguro}`;

    const blob = await put(ruta, buffer, {
      access: "private",
      contentType: tipo,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({
      ok: true,
      url: blob.url,
    });

  } catch (error) {
    console.error("Error subiendo imagen:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo subir la imagen",
    });
  }
}