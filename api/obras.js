import clientPromise from "./mongodb.js";

export default async function handler(req, res) {
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