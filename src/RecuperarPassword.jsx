import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const solicitarRecuperacion = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.ok) {
        setError(
          datos.mensaje ||
            "No se pudo solicitar la recuperación."
        );
        return;
      }

      setMensaje(datos.mensaje);
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
        onSubmit={solicitarRecuperacion}
        className="login-form"
      >
        <h2>Recuperar contraseña</h2>

        <p>
          Ingresá tu email para recibir un enlace
          de recuperación.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={cargando}>
          {cargando
            ? "Enviando..."
            : "Enviar enlace"}
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

export default RecuperarPassword;