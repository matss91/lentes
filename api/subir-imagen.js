
import jwt from "jsonwebtoken";
import { put } from "@vercel/blob";

export default async function handler(req, res) {
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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      mensaje: "Método no permitido",
    });
  }

  try {
    // =========================
    // TOKEN DE ADMIN
    // =========================

    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        ok: false,
        mensaje: "Falta el token de administrador",
      });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        mensaje: "Formato de token inválido",
      });
    }

    const token = authorization.substring(7);

    let usuario;

    try {
      usuario = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token inválido o vencido",
      });
    }

    if (usuario.rol !== "admin") {
      return res.status(403).json({
        ok: false,
        mensaje: "No tenés permisos de administrador",
      });
    }

    // =========================
    // DATOS
    // =========================

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

    // =========================
    // BASE64
    // =========================

    const partes = imagen.split(",");

    if (partes.length !== 2) {
      return res.status(400).json({
        ok: false,
        mensaje: "Formato de imagen inválido",
      });
    }

    const buffer = Buffer.from(
      partes[1],
      "base64"
    );

    // =========================
    // NOMBRE ÚNICO
    // =========================

    const extension =
      nombreArchivo.includes(".")
        ? nombreArchivo
            .split(".")
            .pop()
            .toLowerCase()
        : "jpg";

    const nombreUnico =
      `productos/imagenes/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${extension}`;

    // =========================
    // COMPROBAR TOKEN BLOB
    // =========================

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({
        ok: false,
        mensaje: "Falta BLOB_READ_WRITE_TOKEN en Vercel",
      });
    }

    // =========================
    // SUBIR IMAGEN
    // =========================

    const blob = await put(
      nombreUnico,
      buffer,
      {
        access: "public",
        contentType: tipo || "image/jpeg",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );

    return res.status(200).json({
      ok: true,
      mensaje: "Imagen subida correctamente",
      url: blob.url,
    });

  } catch (error) {
    console.error(
      "ERROR REAL SUBIENDO IMAGEN:",
      error
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        error?.message ||
        "Error desconocido al subir la imagen",
    });
  }
}

