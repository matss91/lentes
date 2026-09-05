import jwt from "jsonwebtoken";
import { put, head } from "@vercel/blob";

const NOMBRE_ARCHIVO =
  "productos/productos.json";

// =========================
// VERIFICAR TOKEN
// =========================

function verificarToken(req) {
  const auth =
    req.headers.authorization;

  if (
    !auth ||
    !auth.startsWith("Bearer ")
  ) {
    return null;
  }

  const token =
    auth.split(" ")[1];

  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET
    );
  } catch {
    return null;
  }
}

// =========================
// LEER PRODUCTOS DESDE BLOB
// =========================

async function obtenerProductos() {
  const blob = await head(
    NOMBRE_ARCHIVO,
    {
      token:
        process.env
          .BLOB_READ_WRITE_TOKEN,
    }
  );

  const respuesta =
    await fetch(blob.url, {
      headers: {
        Authorization:
          `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
      cache: "no-store",
    });

  if (!respuesta.ok) {
    throw new Error(
      `Error descargando Blob: ${respuesta.status}`
    );
  }

  const productos =
    await respuesta.json();

  if (!Array.isArray(productos)) {
    throw new Error(
      "El archivo de productos no contiene un array válido."
    );
  }

  return productos;
}

// =========================
// GUARDAR PRODUCTOS EN BLOB
// =========================


async function guardarProductos(productos) {
  console.log("GUARDANDO PRODUCTOS:", productos);

  const blob = await put(
    NOMBRE_ARCHIVO,
    JSON.stringify(productos, null, 2),
    {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  );

  console.log("BLOB GUARDADO:", blob.url);

  return blob;
}



// =========================
// HANDLER
// =========================

export default async function handler(
  req,
  res
) {
  console.log(
    "MÉTODO RECIBIDO:",
    req.method
  );

  // =========================
  // CORS
  // =========================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://lentes-mocha.vercel.app"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // =========================
  // PREFLIGHT
  // =========================

  if (req.method === "OPTIONS") {
    return res
      .status(200)
      .end();
  }

  // =========================
  // GET
  // =========================

  if (req.method === "GET") {
    try {
      const productos =
        await obtenerProductos();

      console.log(
        "PRODUCTOS EN GET:",
        productos
      );

      return res
        .status(200)
        .json(productos);
    } catch (error) {
      console.error(
        "ERROR LEYENDO PRODUCTOS:",
        error
      );

      return res
        .status(500)
        .json({
          ok: false,
          mensaje:
            "No se pudieron obtener los productos",
          error:
            error.message,
        });
    }
  }

  // =========================
  // POST
  // AGREGAR PRODUCTO
  // =========================

  if (req.method === "POST") {
    const usuario =
      verificarToken(req);

    if (
      !usuario ||
      usuario.rol !== "admin"
    ) {
      return res
        .status(401)
        .json({
          ok: false,
          mensaje:
            "No autorizado",
        });
    }

    try {
      const {
        nombre,
        precio,
        descripcion,
        imagenes,
      } = req.body;

      // Validaciones
      if (
        typeof nombre !==
          "string" ||
        !nombre.trim()
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            mensaje:
              "El nombre es obligatorio",
          });
      }

      if (
        typeof precio !==
          "number" ||
        !Number.isFinite(
          precio
        ) ||
        precio < 0
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            mensaje:
              "El precio no es válido",
          });
      }

      if (
        typeof descripcion !==
          "string" ||
        !descripcion.trim()
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            mensaje:
              "La descripción es obligatoria",
          });
      }

      if (
        !Array.isArray(
          imagenes
        ) ||
        imagenes.length === 0
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            mensaje:
              "Debe existir al menos una imagen",
          });
      }

      // LEER PRODUCTOS ACTUALES
      const productos =
        await obtenerProductos();

      console.log(
        "PRODUCTOS ANTES DEL POST:",
        productos
      );

      // GENERAR ID
      const nuevoId =
        productos.length > 0
          ? Math.max(
              ...productos.map(
                (producto) =>
                  Number(
                    producto.id
                  ) || 0
              )
            ) + 1
          : 1;
console.log("IDS ANTES DE GENERAR ID:", productos.map(producto => producto.id));
console.log("NUEVO ID GENERADO:", nuevoId);
      const nuevoProducto = {
        id: nuevoId,
        nombre:
          nombre.trim(),
        precio,
        descripcion:
          descripcion.trim(),
        imagenes:
          imagenes
            .filter(
              (imagen) =>
                typeof imagen ===
                "string"
            )
            .map(
              (imagen) =>
                imagen.trim()
            )
            .filter(Boolean),
      };

      productos.push(
        nuevoProducto
      );

      console.log(
        "PRODUCTOS DESPUÉS DEL POST:",
        productos
      );

      // GUARDAR TODO EL ARRAY
      await guardarProductos(
        productos
      );

      return res
        .status(201)
        .json({
          ok: true,
          mensaje:
            "Producto agregado correctamente",
          producto:
            nuevoProducto,
        });
    } catch (error) {
      console.error(
        "ERROR GUARDANDO PRODUCTO:",
        error
      );

      return res
        .status(500)
        .json({
          ok: false,
          mensaje:
            "No se pudo guardar el producto",
          error:
            error.message,
        });
    }
  }

  // =========================
  // PUT
  // EDITAR PRODUCTO
  // =========================

  if (req.method === "PUT") {
    const usuario =
      verificarToken(req);

    if (
      !usuario ||
      usuario.rol !== "admin"
    ) {
      return res
        .status(401)
        .json({
          ok: false,
          mensaje:
            "No autorizado",
        });
    }

    try {
      const {
        id,
        nombre,
        precio,
        descripcion,
        imagenes,
      } = req.body;

      if (
        id === undefined ||
        id === null
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            mensaje:
              "Falta el ID del producto",
          });
      }

      const productos =
        await obtenerProductos();

      console.log(
        "PRODUCTOS ANTES DEL PUT:",
        productos
      );

      const indice =
        productos.findIndex(
          (producto) =>
            Number(
              producto.id
            ) ===
            Number(id)
        );

      if (indice === -1) {
        return res
          .status(404)
          .json({
            ok: false,
            mensaje:
              "Producto no encontrado",
          });
      }

      const productoAnterior =
        productos[indice];

      productos[indice] = {
        ...productoAnterior,

        nombre:
          typeof nombre ===
          "string"
            ? nombre.trim()
            : productoAnterior.nombre,

        precio:
          precio !== undefined
            ? Number(precio)
            : productoAnterior.precio,

        descripcion:
          typeof descripcion ===
          "string"
            ? descripcion.trim()
            : productoAnterior.descripcion,

        imagenes:
          Array.isArray(
            imagenes
          )
            ? imagenes
            : productoAnterior.imagenes,
      };

      await guardarProductos(
        productos
      );

      console.log(
        "PRODUCTOS DESPUÉS DEL PUT:",
        productos
      );

      return res
        .status(200)
        .json({
          ok: true,
          mensaje:
            "Producto actualizado correctamente",
          producto:
            productos[indice],
        });
    } catch (error) {
      console.error(
        "ERROR ACTUALIZANDO PRODUCTO:",
        error
      );

      return res
        .status(500)
        .json({
          ok: false,
          mensaje:
            "Error actualizando producto",
          error:
            error.message,
        });
    }
  }

  // =========================
  // DELETE
  // ELIMINAR PRODUCTO
  // =========================

  if (req.method === "DELETE") {
    const usuario =
      verificarToken(req);

    if (
      !usuario ||
      usuario.rol !== "admin"
    ) {
      return res
        .status(401)
        .json({
          ok: false,
          mensaje:
            "No autorizado",
        });
    }

    try {
      const { id } =
        req.body;

      console.log(
        "ID RECIBIDO PARA ELIMINAR:",
        id
      );

      if (
        id === undefined ||
        id === null
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            mensaje:
              "Falta el ID del producto",
          });
      }

      // LEER PRODUCTOS ACTUALES
      const productos =
        await obtenerProductos();

      console.log(
        "IDS DE PRODUCTOS:",
        productos.map(
          (producto) =>
            producto.id
        )
      );

      console.log(
        "PRODUCTOS ANTES DE ELIMINAR:",
        productos
      );

      const indice =
        productos.findIndex(
          (producto) =>
            Number(
              producto.id
            ) ===
            Number(id)
        );

      if (indice === -1) {
        return res
          .status(404)
          .json({
            ok: false,
            mensaje:
              "Producto no encontrado",
          });
      }

      // Guardamos el producto eliminado
      const productoEliminado =
        productos[indice];

      // Eliminamos SOLO ese producto
      productos.splice(
        indice,
        1
      );

      console.log(
        "PRODUCTOS DESPUÉS DE ELIMINAR:",
        productos
      );

      // GUARDAMOS EL ARRAY ACTUALIZADO
      await guardarProductos(
        productos
      );

      return res
        .status(200)
        .json({
          ok: true,
          mensaje:
            "Producto eliminado correctamente",
          producto:
            productoEliminado,
        });
    } catch (error) {
      console.error(
        "ERROR ELIMINANDO PRODUCTO:",
        error
      );

      return res
        .status(500)
        .json({
          ok: false,
          mensaje:
            "Error eliminando producto",
          error:
            error.message,
        });
    }
  }

  // =========================
  // MÉTODO NO PERMITIDO
  // =========================

  return res
    .status(405)
    .json({
      ok: false,
      mensaje:
        "Método no permitido",
    });
}