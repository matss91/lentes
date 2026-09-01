import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      mensaje: "Método no permitido",
    });
  }

  try {
    // Verificar token de administrador
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        mensaje: "No autorizado",
      });
    }

    const token = auth.replace("Bearer ", "");

    // Importante:
    // Acá usamos el mismo JWT_SECRET que usás en /api/login
    const jwt = await import("jsonwebtoken");

    try {
      jwt.default.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        ok: false,
        mensaje: "Token inválido o vencido",
      });
    }

    const { imagen, nombreArchivo, tipo } = req.body || {};

    if (!imagen) {
      return res.status(400).json({
        ok: false,
        mensaje: "Falta la imagen",
      });
    }

    if (!nombreArchivo) {
      return res.status(400).json({
        ok: false,
        mensaje: "Falta el nombre del archivo",
      });
    }

    // La imagen llega como:
    // data:image/jpeg;base64,XXXXX
    const partes = imagen.split(",");

    if (partes.length !== 2) {
      return res.status(400).json({
        ok: false,
        mensaje: "Formato de imagen inválido",
      });
    }

    const base64 = partes[1];

    const buffer = Buffer.from(base64, "base64");

    // Nombre único para evitar que una imagen pise otra
    const extension =
      nombreArchivo.split(".").pop()?.toLowerCase() || "jpg";

    const nombreUnico = `productos/imagenes/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${extension}`;

    const blob = await put(nombreUnico, buffer, {
      access: "public",
      contentType: tipo || "image/jpeg",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({
      ok: true,
      mensaje: "Imagen subida correctamente",
      url: blob.url,
    });
  } catch (error) {
    console.error("Error subiendo imagen:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo subir la imagen",
      error: error.message,
    });
  }
}