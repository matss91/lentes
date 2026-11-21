import express from "express";
import cors from "cors";
import "dotenv/config";
import {
  MercadoPagoConfig,
  Preference,
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from "mercadopago";
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


// Prueba de funcionamiento del endpoint
app.get("/api/webhook-mercadopago", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Endpoint de Mercado Pago funcionando",
  });
});

// Recepción y validación de notificaciones
app.post("/api/webhook-mercadopago", (req, res) => {
  const secret = process.env.MP_WEBHOOK_SECRET;

  if (!secret) {
    return res.status(503).json({
      ok: false,
      mensaje: "Falta configurar MP_WEBHOOK_SECRET",
    });
  }

  const dataId = req.query["data.id"] || req.query.data_id;

  if (!dataId) {
    return res.status(400).json({
      ok: false,
      mensaje: "Falta el ID del pago",
    });
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers["x-signature"],
      xRequestId: req.headers["x-request-id"],
      dataId: String(dataId),
      secret,
    });

    return res.status(200).json({
      ok: true,
      mensaje: "Notificación recibida y firma válida",
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      return res.status(401).json({
        ok: false,
        mensaje: "Firma inválida",
      });
    }

    console.error("Error validando webhook:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno",
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

app.get("/api/buscar-pago", async (req, res) => {
  try {
    const respuesta = await fetch(
      "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=30",
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      return res.status(respuesta.status).json({
        ok: false,
        mensaje: "Error consultando Mercado Pago",
      });
    }

    res.json({
      ok: true,
      pagos: datos.results.map((p) => ({
        id: p.id,
        estado: p.status,
        descripcion: p.description,
        fecha: p.date_created,
        monto: p.transaction_amount,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
});

export default app;