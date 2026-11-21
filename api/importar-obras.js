
import { get } from "@vercel/blob";
import clientPromise from "./mongodb.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      mensaje: "Método no permitido",
    });
  }

  try {
    // Protección de la importación
    const secret = process.env.IMPORT_OBRAS_SECRET;

    if (!secret) {
      return res.status(500).json({
        ok: false,
        mensaje: "Falta configurar IMPORT_OBRAS_SECRET",
      });
    }

    if (req.headers.authorization !== `Bearer ${secret}`) {
      return res.status(401).json({
        ok: false,
        mensaje: "No autorizado",
      });
    }

    // Leer productos actuales de Blob
    const archivo = await get("productos/productos.json", {
      access: "private",
    });

    if (!archivo || !archivo.stream) {
      throw new Error("No se encontró productos.json");
    }

    const contenido = await new Response(
      archivo.stream
    ).text();

    const productos = JSON.parse(contenido);

    if (!Array.isArray(productos) || productos.length === 0) {
      throw new Error("El catálogo está vacío o no es válido");
    }

    // Validar productos
    for (const producto of productos) {
      if (
        !Number.isInteger(Number(producto.id)) ||
        !producto.nombre ||
        !Number.isFinite(Number(producto.precio)) ||
        !Array.isArray(producto.imagenes)
      ) {
        throw new Error(
          `Producto inválido: ${producto.nombre || producto.id}`
        );
      }
    }

    // Conectar con MongoDB
    const client = await clientPromise;
    const db = client.db();

    const coleccion = db.collection("obras");

    // Importar sin duplicar ni sobrescribir obras existentes
    const operaciones = productos.map((producto) => ({
      updateOne: {
        filter: { id: Number(producto.id) },
        update: {
          $setOnInsert: {
            id: Number(producto.id),
            nombre: producto.nombre,
            precio: Number(producto.precio),
            descripcion: producto.descripcion || "",
            imagenes: producto.imagenes,
            estado: "disponible",
            fechaCreacion: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const resultado = await coleccion.bulkWrite(operaciones);

    return res.status(200).json({
      ok: true,
      mensaje: "Importación finalizada",
      productosLeidos: productos.length,
      productosNuevos: resultado.upsertedCount,
      productosYaExistentes: resultado.matchedCount,
      coleccion: "obras",
    });

  } catch (error) {
    console.error("ERROR IMPORTANDO OBRAS:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error importando productos",
      error: error.message,
    });
  }
}
