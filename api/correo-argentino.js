import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
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
app.post("/api/cotizar-envio", (req, res) => {
  const {
    codigoPostal,
    peso,
    alto,
    ancho,
    largo,
  } = req.body;

  if (
    !codigoPostal ||
    !peso ||
    !alto ||
    !ancho ||
    !largo
  ) {
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
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Backend funcionando en http://localhost:${PORT}`);
});