import express from "express";
import cors from "cors";
import "dotenv/config";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { get } from "@vercel/blob";

const app = express();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

app.use(
  cors({
    origin: [
      "https://lentes-mocha.vercel.app",
      "https://lentes-git-master-matss91s-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

function calcularCostoEnvio({ peso, alto, ancho, largo }) {
  const volumen = alto * ancho * largo;

  let precio = 5000;

  if (peso > 1) {
    precio += (peso - 1) * 1500;
  }

  if (volumen > 10000) {
    precio += 2000;
  }

  return Math.round(precio);
}

app.get("/api/estado", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Backend de Correo Argentino funcionando",
  });
});


app.get("/api/probar-blob", async (req, res) => {
  try {
    const archivo = await get("productos/productos.json", {
      access: "private",
    });

    if (!archivo || !archivo.stream) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró productos.json",
      });
    }

    const contenido = await new Response(archivo.stream).text();
    const productos = JSON.parse(contenido);

    if (!Array.isArray(productos)) {
      throw new Error("El archivo no contiene una lista de productos");
    }

    res.json({
      ok: true,
      mensaje: "Conexión con Blob correcta",
      cantidadProductos: productos.length,
    });
  } catch (error) {
    console.error("Error leyendo Blob:", error);

    res.status(500).json({
      ok: false,
      mensaje: "No se pudo leer productos.json",
      error: error.message,
    });
  }
});


app.post("/api/cotizar-envio", (req, res) => {
  const {
    codigoPostal,
    peso,
    alto,
    ancho,
    largo,
  } = req.body;

  if (!codigoPostal || !peso || !alto || !ancho || !largo) {
    return res.status(400).json({
      ok: false,
      mensaje: "Faltan datos del envío",
    });
  }

  const precio = calcularCostoEnvio({
    peso,
    alto,
    ancho,
    largo,
  });

  const volumen = alto * ancho * largo;

  res.json({
    ok: true,
    mensaje: "Cotización calculada correctamente",
    envio: {
      codigoPostal,
      peso,
      alto,
      ancho,
      largo,
      volumen,
      precio,
      moneda: "ARS",
      servicio: "PAQ.AR - TEST",
    },
  });
});

app.post("/api/crear-preferencia", async (req, res) => {
  try {
    const { productos, envio } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "No hay productos en el carrito",
      });
    }

    const items = productos.map((producto) => ({
      title: producto.nombre,
      quantity: Number(producto.cantidad),
      unit_price: Number(producto.precio),
      currency_id: "ARS",
    }));

    if (Number(envio) > 0) {
      items.push({
        title: "Envío",
        quantity: 1,
        unit_price: Number(envio),
        currency_id: "ARS",
      });
    }

    const preference = new Preference(client);

    const resultado = await preference.create({
      body: {
        items,

        back_urls: {
          success: "https://lentes-mocha.vercel.app",
          failure: "https://lentes-mocha.vercel.app",
          pending: "https://lentes-mocha.vercel.app",
        },

        auto_return: "approved",
      },
    });

    res.json({
      ok: true,
      id: resultado.id,
      link: resultado.init_point,
    });

  } catch (error) {
    console.error("Error creando preferencia:", error);

    res.status(500).json({
      ok: false,
      mensaje: "No se pudo crear el pago",
    });
  }
});

export default app;