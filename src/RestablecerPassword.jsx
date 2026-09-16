import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function RestablecerPassword() {
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
console.log("TOKEN RECIBIDO:", token);
  const cambiarPassword = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!token) {
      setError("El enlace de recuperación no contiene un token.");
      return;
    }

    if (password.length < 8) {
      setError(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.ok) {
        setError(
          datos.mensaje ||
            "No se pudo actualizar la contraseña."
        );
        return;
      }

      setMensaje(datos.mensaje);
      setPassword("");
      setConfirmarPassword("");
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <form
        onSubmit={cambiarPassword}
        className="login-form"
      >
        <h2>Nueva contraseña</h2>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmarPassword}
          onChange={(e) =>
            setConfirmarPassword(e.target.value)
          }
          minLength={8}
          required
        />

        <button type="submit" disabled={cargando}>
          {cargando
            ? "Actualizando..."
            : "Cambiar contraseña"}
        </button>

        {mensaje && <p>{mensaje}</p>}

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Volver al inicio
        </button>
      </form>
    </div>
  );
}

export default RestablecerPassword;