```js
import jwt from "jsonwebtoken";

export default function handler(req, res) {
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

  const { usuario, password } = req.body;

  const adminUsuario = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminUsuario || !adminPassword || !jwtSecret) {
    return res.status(500).json({
      ok: false,
      mensaje: "El administrador no está configurado",
    });
  }

  const usuarioCorrecto =
    typeof usuario === "string" &&
    usuario === adminUsuario;

  const passwordCorrecta =
    typeof password === "string" &&
    password === adminPassword;

  if (!usuarioCorrecto || !passwordCorrecta) {
    return res.status(401).json({
      ok: false,
      mensaje: "Usuario o contraseña incorrectos",
    });
  }

  // Crear token firmado
  const token = jwt.sign(
    {
      rol: "admin",
    },
    jwtSecret,
    {
      expiresIn: "2h",
    }
  );

  return res.status(200).json({
    ok: true,
    token,
  });
}
```
