import bcrypt from "bcryptjs";
import { get, put } from "@vercel/blob";

export default async function handler(req, res) {
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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      mensaje: "Método no permitido.",
    });
  }

  try {
    const {
      usuario,
      passwordActual,
      passwordNueva,
      confirmarPassword,
    } = req.body;

    // Verificar campos
    if (
      !usuario ||
      !passwordActual ||
      !passwordNueva ||
      !confirmarPassword
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: "Completá todos los campos.",
      });
    }

    // Verificar nuevas contraseñas
    if (passwordNueva !== confirmarPassword) {
      return res.status(400).json({
        ok: false,
        mensaje: "Las nuevas contraseñas no coinciden.",
      });
    }

    // Mínimo 8 caracteres
    if (passwordNueva.length < 8) {
      return res.status(400).json({
        ok: false,
        mensaje: "La nueva contraseña debe tener al menos 8 caracteres.",
      });
    }

    // No permitir la misma contraseña
    if (passwordActual === passwordNueva) {
      return res.status(400).json({
        ok: false,
        mensaje: "La nueva contraseña debe ser diferente a la actual.",
      });
    }

    // Leer usuarios
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

    // Buscar usuario
    const administrador = administradores.find(
      (admin) => admin.usuario === usuario
    );

    if (!administrador || !administrador.passwordHash) {
      return res.status(401).json({
        ok: false,
        mensaje: "Usuario o contraseña incorrectos.",
      });
    }

    // VALIDAR CONTRASEÑA ACTUAL
    const passwordCorrecta = await bcrypt.compare(
      passwordActual,
      administrador.passwordHash
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        ok: false,
        mensaje: "La contraseña actual es incorrecta.",
      });
    }

    // Crear nuevo hash
    const nuevoPasswordHash = await bcrypt.hash(
      passwordNueva,
      12
    );

    administrador.passwordHash = nuevoPasswordHash;

    // Guardar cambios
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

    return res.status(200).json({
      ok: true,
      mensaje: "Contraseña cambiada correctamente.",
    });

  } catch (error) {
    console.error("Error cambiando contraseña:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo cambiar la contraseña.",
    });
  }
}
