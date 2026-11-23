import express from "express";
import cors from "cors";
import "dotenv/config";

import { randomUUID } from "node:crypto";

import {
  MercadoPagoConfig,
  Preference,
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from "mercadopago";
import { get } from "@vercel/blob";
import clientPromise from "./mongodb.js";
const app = express();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const dominiosPermitidos = [
  "https://espacioarte.vercel.app",
  "https://lentes-mocha.vercel.app",
  "https://lentes-git-master-matss91s-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        dominiosPermitidos.includes(origin) ||
        /^https:\/\/lentes-[a-z0-9]+-matss91s-projects\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Origen no autorizado por CORS"));
    },
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
  let clientMongo;
  let reservaId;
  let obrasReservadas = [];

  try {
    const { productos, envio = 0 } = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "No hay productos en el carrito",
      });
    }

    // Cada obra es única: cantidad máxima 1
    const ids = productos.map(p => Number(p.id));

    if (
      ids.some(id => !Number.isInteger(id) || id <= 0) ||
      new Set(ids).size !== ids.length ||
      productos.some(p => Number(p.cantidad) !== 1)
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: "Hay productos duplicados o cantidades inválidas",
      });
    }

    const costoEnvio = Number(envio);

    if (!Number.isFinite(costoEnvio) || costoEnvio < 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "Envío inválido",
      });
    }

    // Conectar con MongoDB
    clientMongo = await clientPromise;
    const db = clientMongo.db();
    const obras = db.collection("obras");

    reservaId = randomUUID();

    const ahora = new Date();
    const reservaHasta = new Date(
      ahora.getTime() + 20 * 60 * 1000
    );

    const items = [];

    // Reservar cada obra de manera atómica
    for (const id of ids) {

      const obra = await obras.findOne({ id });

      if (!obra) {
        throw new Error(`No existe la obra ${id}`);
      }

      const resultado = await obras.updateOne(
        {
          id,
          $or: [
            { estado: "disponible" },
            {
              estado: "reservado",
              reservaHasta: { $lte: ahora }
            }
          ]
        },
        {
          $set: {
            estado: "reservado",
            reservaId,
            reservaHasta
          }
        }
      );

      if (resultado.modifiedCount !== 1) {
        throw new Error(
          `La obra "${obra.nombre}" ya no está disponible`
        );
      }

      obrasReservadas.push(id);

      items.push({
        title: obra.nombre,
        quantity: 1,
        unit_price: Number(obra.precio),
        currency_id: "ARS"
      });
    }

    // Agregar envío
    if (costoEnvio > 0) {
      items.push({
        title: "Envío",
        quantity: 1,
        unit_price: costoEnvio,
        currency_id: "ARS"
      });
    }

    // Crear preferencia
    const preference = new Preference(client);

    const resultado = await preference.create({
      body: {
        items,

        external_reference: reservaId,

        metadata: {
          reserva_id: reservaId,
          obra_ids: ids
        },

        expires: true,
        expiration_date_from: ahora.toISOString(),
        expiration_date_to: reservaHasta.toISOString(),

        back_urls: {
          success: "https://espacioarte.vercel.app",
          failure: "https://espacioarte.vercel.app",
          pending: "https://espacioarte.vercel.app"
        },

        auto_return: "approved"
      }
    });

    return res.json({
      ok: true,
      id: resultado.id,
      link: resultado.init_point,
      reservaId
    });

  } catch (error) {

    console.error("ERROR CREANDO PREFERENCIA:", error);

    // Liberar las reservas si falla la operación
    if (clientMongo && reservaId && obrasReservadas.length > 0) {
      try {
        await clientMongo.db().collection("obras").updateMany(
          {
            id: { $in: obrasReservadas },
            reservaId
          },
          {
            $set: { estado: "disponible" },
            $unset: {
              reservaId: "",
              reservaHasta: ""
            }
          }
        );
      } catch (errorLiberacion) {
        console.error("ERROR LIBERANDO RESERVAS:", errorLiberacion);
      }
    }

    return res.status(400).json({
      ok: false,
      mensaje: error.message
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

app.get("/api/probar-mongodb", async (req, res) => {
  try {
    const client = await clientPromise;

    await client.db("admin").command({ ping: 1 });

    res.json({
      ok: true,
      mensaje: "Conexión con MongoDB correcta",
    });
  } catch (error) {
    console.error("Error MongoDB:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error conectando con MongoDB",
    });
  }
});

export default app;