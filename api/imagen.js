import { head } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      mensaje: "Método no permitido",
    });
  }

  try {
    const { nombre } = req.query;

    if (!nombre) {
      return res.status(400).json({
        ok: false,
        mensaje: "Falta el nombre de la imagen",
      });
    }

    const blob = await head(`imagenes/${nombre}`, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const respuesta = await fetch(blob.url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!respuesta.ok) {
      return res.status(404).json({
        ok: false,
        mensaje: "Imagen no encontrada",
      });
    }

    const contenido = await respuesta.arrayBuffer();

    res.setHeader(
      "Content-Type",
      blob.contentType || "image/jpeg"
    );

    return res.status(200).send(Buffer.from(contenido));

  } catch (error) {
    console.error("Error obteniendo imagen:", error);

    return res.status(404).json({
      ok: false,
      mensaje: "No se pudo obtener la imagen",
    });
  }
}