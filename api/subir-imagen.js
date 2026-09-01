
export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      mensaje: "API subir-imagen funcionando"
    });
  }

  if (req.method === "POST") {
    return res.status(200).json({
      ok: true,
      mensaje: "POST funcionando correctamente"
    });
  }

  return res.status(405).json({
    ok: false,
    mensaje: "Método no permitido"
  });
}


