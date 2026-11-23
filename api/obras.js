
import clientPromise from "./mongodb.js";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      mensaje: "Método no permitido",
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const obras = await db
      .collection("obras")
      .find({})
      .sort({ id: 1 })
      .toArray();

    return res.status(200).json({
      ok: true,
      total: obras.length,
      obras,
    });

  } catch (error) {
    console.error("ERROR CONSULTANDO OBRAS:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error consultando MongoDB",
      error: error.message,
    });
  }
}
