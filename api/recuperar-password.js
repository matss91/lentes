import crypto from "crypto";
import bcrypt from "bcryptjs";
import { get, put } from "@vercel/blob";

export default async function handler(req, res) {
  // CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://lentes-mocha.vercel.app"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      mensaje: "Método no permitido",
    });
  }

  try {
    // ==========================================
    // 1. OBTENER DATOS
    // ==========================================

    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: "Datos incompletos.",
      });
    }

    // ==========================================
    // 2. VALIDAR CONTRASEÑA
    // ==========================================

    if (password.length < 8) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "La contraseña debe tener al menos 8 caracteres.",
      });
    }

    // ==========================================
    // 3. HASH DEL TOKEN
    // ==========================================

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
console.log(
  "RESET RECIBIDO - HASH:",
  tokenHash.slice(0, 8),
  "AHORA:",
  Date.now()
);
    // ==========================================
    // 4. LEER usuarios.json DESDE BLOB
    // ==========================================

    const resultado = await get("usuarios/usuarios.json", {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!resultado || !resultado.stream) {
      return res.status(500).json({
        ok: false,
        mensaje: "No se pudo leer usuarios.json.",
      });
    }

    const texto = await new Response(
      resultado.stream
    ).text();

    const administradores = JSON.parse(texto);

    // ==========================================
    // 5. BUSCAR TOKEN
    // ==========================================

    const usuario = administradores.find(
      (admin) =>
        admin.resetToken === tokenHash &&
        admin.resetTokenExpires &&
        admin.resetTokenExpires > Date.now()
    );

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "El enlace no es válido o ya venció.",
      });
    }

    // ==========================================
    // 6. GENERAR NUEVO PASSWORD HASH
    // ==========================================

    usuario.passwordHash = await bcrypt.hash(
      password,
      12
    );

    // ==========================================
    // 7. ELIMINAR TOKEN
    // ==========================================

    delete usuario.resetToken;
    delete usuario.resetTokenExpires;

    // ==========================================
    // 8. GUARDAR EN BLOB
    // ==========================================

    await put(
      "usuarios/usuarios.json",
      JSON.stringify(administradores, null, 2),
      {
        access: "private",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: "application/json",
        allowOverwrite: true,
      }
    );

    // ==========================================
    // 9. RESPUESTA
    // ==========================================

    return res.status(200).json({
      ok: true,
      mensaje:
        "Contraseña actualizada correctamente.",
    });

  } catch (error) {
    console.error(
      "Error recuperando contraseña:",
      error
    );

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo actualizar la contraseña.",
    });
  }
}