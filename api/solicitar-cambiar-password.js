import crypto from "crypto";
import nodemailer from "nodemailer";
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
    // 1. OBTENER EMAIL
    // ==========================================

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        mensaje: "Ingresá tu email.",
      });
    }

    // ==========================================
    // 2. MAPEAR EMAIL → USUARIO
    // ==========================================

    const emails = {
      AdminGiselle: process.env.EMAIL_ADMIN_GISELLE,
      AdminFabiano: process.env.EMAIL_ADMIN_FABIANO,
      AdminMatias: process.env.EMAIL_ADMIN_MATIAS,
    };

    // ==========================================
    // 3. LEER usuarios.json DESDE BLOB
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
    // 4. BUSCAR USUARIO POR EMAIL
    // ==========================================

    const emailBuscado = email.trim().toLowerCase();

    const usuario = administradores.find(
      (admin) =>
        emails[admin.usuario]?.toLowerCase() === emailBuscado
    );

    // No revelar si el email existe
    if (!usuario) {
      return res.status(200).json({
        ok: true,
        mensaje:
          "Si el email está registrado, recibirás un enlace para recuperar tu contraseña.",
      });
    }

    // ==========================================
    // 5. GENERAR TOKEN
    // ==========================================

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    usuario.resetToken = tokenHash;

    usuario.resetTokenExpires =
      Date.now() + 15 * 60 * 1000;

    // ==========================================
    // 6. GUARDAR EN BLOB
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
    // 7. CREAR LINK
    // ==========================================

    const link =
  `${process.env.FRONTEND_URL}/?reset=1&token=${token}`;

    // ==========================================
    // 8. CONFIGURAR NODEMAILER
    // ==========================================

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // ==========================================
    // 9. ENVIAR EMAIL
    // ==========================================

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emails[usuario.usuario],
      subject: "Recuperación de contraseña",
      html: `
        <h2>Recuperar contraseña</h2>

        <p>Recibimos una solicitud para cambiar tu contraseña.</p>

        <p>
          <a href="${link}">
            Restablecer contraseña
          </a>
        </p>

        <p>Este enlace vence en 15 minutos.</p>

        <p>
          Si vos no solicitaste este cambio,
          podés ignorar este correo.
        </p>
      `,
    });

    return res.status(200).json({
      ok: true,
      mensaje:
        "Si el email está registrado, recibirás un enlace para recuperar tu contraseña.",
    });

  } catch (error) {
    console.error(
      "Error solicitando recuperación:",
      error
    );

    return res.status(500).json({
      ok: false,
      mensaje: "Ocurrió un error al solicitar la recuperación.",
    });
  }
}