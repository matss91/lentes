
import jwt from "jsonwebtoken";
import { put, head } from "@vercel/blob";

const NOMBRE_ARCHIVO = "productos/productos.json";

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
    "GET, POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: obtener productos
if (req.method === "GET") {
  try {
    const blob = await head(NOMBRE_ARCHIVO);

    const respuesta = await fetch(blob.url);

    if (!respuesta.ok) {
      throw new Error(
        `Error descargando Blob: ${respuesta.status}`
      );
    }

    const productos = await respuesta.json();

    return res.status(200).json(productos);
  } catch (error) {
    console.error("ERROR LEYENDO PRODUCTOS:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron obtener los productos",
      error: error.message,
    });
  }
}

  // POST: agregar producto
  if (req.method === "POST") {
    const usuario = verificarToken(req);

    if (!usuario || usuario.rol !== "admin") {
      return res.status(401).json({
        ok: false,
        mensaje: "No autorizado",
      });
    }

    try {
      const { nombre, precio, descripcion, imagenes } = req.body;

      if (
        typeof nombre !== "string" ||
        !nombre.trim() ||
        typeof precio !== "number" ||
        precio < 0 ||
        typeof descripcion !== "string" ||
        !Array.isArray(imagenes) ||
        imagenes.length === 0
      ) {
        return res.status(400).json({
          ok: false,
          mensaje: "Datos del producto inválidos",
        });
      }

      let productos = [];

      try {
        const blob = await head(NOMBRE_ARCHIVO);
        const respuesta = await fetch(blob.url);
        productos = await respuesta.json();

        if (!Array.isArray(productos)) {
          productos = [];
        }
      } catch {
        // Si todavía no existe el archivo, empezamos con un array vacío.
        productos = [];
      }

      const nuevoId =
        productos.length > 0
          ? Math.max(...productos.map((p) => Number(p.id) || 0)) + 1
          : 1;

      const nuevoProducto = {
        id: nuevoId,
        nombre: nombre.trim(),
        precio,
        descripcion: descripcion.trim(),
        imagenes: imagenes
          .filter((imagen) => typeof imagen === "string")
          .map((imagen) => imagen.trim())
          .filter(Boolean),
      };

      productos.push(nuevoProducto);

      await put(
        NOMBRE_ARCHIVO,
        JSON.stringify(productos, null, 2),
        {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
        }
      );

      return res.status(201).json({
        ok: true,
        mensaje: "Producto agregado correctamente",
        producto: nuevoProducto,
      });
    } catch (error) {
      console.error("Error guardando producto:", error);

      return res.status(500).json({
        ok: false,
        mensaje: "No se pudo guardar el producto",
      });
    }
  }

  return res.status(405).json({
    ok: false,
    mensaje: "Método no permitido",
  });
}

