```js
import jwt from "jsonwebtoken";
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
    "Content-Type, Authorization"
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
    // 1. OBTENER TOKEN
    // ==========================================

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        mensaje: "No hay token de administrador.",
      });
    }

    const token = authHeader.split(" ")[1];

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        ok: false,
        mensaje: "JWT_SECRET no está configurado.",
      });
    }

    // ==========================================
    // 2. VERIFICAR JWT
    // ==========================================

    let datosToken;

    try {
      datosToken = jwt.verify(token, jwtSecret);
    } catch (error) {
      return res.status(401).json({
        ok: false,
        mensaje: "Sesión inválida o expirada.",
      });
    }

    if (datosToken.rol !== "admin" || !datosToken.usuario) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tenés permisos de administrador.",
      });
    }

    // ==========================================
    // 3. OBTENER CONTRASEÑAS
    // ==========================================

    const {
      passwordActual,
      passwordNueva,
      confirmarPassword,
    } = req.body;

    if (!passwordActual || !passwordNueva || !confirmarPassword) {
      return res.status(400).json({
        ok: false,
        mensaje: "Completá todos los campos.",
      });
    }

    if (passwordNueva !== confirmarPassword) {
      return res.status(400).json({
        ok: false,
        mensaje: "Las nuevas contraseñas no coinciden.",
      });
    }

    if (passwordNueva.length < 8) {
      return res.status(400).json({
        ok: false,
        mensaje: "La nueva contraseña debe tener al menos 8 caracteres.",
      });
    }

    if (passwordActual === passwordNueva) {
      return res.status(400).json({
        ok: false,
        mensaje: "La nueva contraseña debe ser diferente a la actual.",
      });
    }

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
    // 5. BUSCAR ADMINISTRADOR
    // ==========================================

    const administrador = administradores.find(
      (admin) => admin.usuario === datosToken.usuario
    );

    if (!administrador || !administrador.passwordHash) {
      return res.status(401).json({
        ok: false,
        mensaje: "No se encontró el administrador.",
      });
    }

    // ==========================================
    // 6. COMPROBAR CONTRASEÑA ACTUAL
    // ==========================================

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

    // ==========================================
    // 7. GENERAR NUEVO HASH
    // ==========================================

    const nuevoPasswordHash = await bcrypt.hash(
      passwordNueva,
      12
    );

    administrador.passwordHash = nuevoPasswordHash;

    // ==========================================
    // 8. GUARDAR usuarios.json EN BLOB
    // ==========================================

    await put(
      "usuarios/usuarios.json",
      JSON.stringify(administradores, null, 2),
      {
        access: "private",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: "application/json",
      }
    );

    // ==========================================
    // 9. RESPUESTA
    // ==========================================

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
```
