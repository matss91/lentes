import { head } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    // Aceptamos GET y HEAD
    if (req.method !== "GET" && req.method !== "HEAD") {
      return res.status(405).json({
        ok: false,
        mensaje: "Método no permitido",
        metodoRecibido: req.method,
      });
    }

    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        ok: false,
        mensaje: "Falta la URL de la imagen",
      });
    }

    const blobUrl = new URL(url);
    const pathname = blobUrl.pathname.substring(1);

    const blob = await head(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const respuesta = await fetch(blob.url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!respuesta.ok) {
      throw new Error(
        `Error descargando imagen: ${respuesta.status}`
      );
    }

    const contenido = await respuesta.arrayBuffer();

    res.setHeader(
      "Content-Type",
      blob.contentType || "image/jpeg"
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=3600"
    );

    // HEAD no debe devolver el contenido
    if (req.method === "HEAD") {
      return res.status(200).end();
    }

    return res.status(200).send(
      Buffer.from(contenido)
    );

  } catch (error) {
    console.error("ERROR OBTENIENDO IMAGEN:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo obtener la imagen",
      error: error.message,
    });
  }
}