
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CambiarPassword() {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function cambiarPassword(e) {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (passwordNueva !== confirmarPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }

    if (passwordNueva.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setError("No hay una sesión de administrador.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        `${API_URL}/api/cambiar-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            passwordActual,
            passwordNueva,
            confirmarPassword,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.ok) {
        throw new Error(
          datos.mensaje || "No se pudo cambiar la contraseña."
        );
      }

      setMensaje("Contraseña cambiada correctamente.");

      setPasswordActual("");
      setPasswordNueva("");
      setConfirmarPassword("");

    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <section style={{ marginTop: "40px" }}>
      <h2>Cambiar contraseña</h2>

      <form onSubmit={cambiarPassword}>
        <div>
          <label>Contraseña actual</label>
          <br />

          <input
            type="password"
            value={passwordActual}
            onChange={(e) =>
              setPasswordActual(e.target.value)
            }
            required
            disabled={cargando}
          />
        </div>

        <br />

        <div>
          <label>Nueva contraseña</label>
          <br />

          <input
            type="password"
            value={passwordNueva}
            onChange={(e) =>
              setPasswordNueva(e.target.value)
            }
            required
            minLength={8}
            disabled={cargando}
          />
        </div>

        <br />

        <div>
          <label>Confirmar nueva contraseña</label>
          <br />

          <input
            type="password"
            value={confirmarPassword}
            onChange={(e) =>
              setConfirmarPassword(e.target.value)
            }
            required
            minLength={8}
            disabled={cargando}
          />
        </div>

        <br />

        <button type="submit" disabled={cargando}>
          {cargando
            ? "Cambiando..."
            : "Cambiar contraseña"}
        </button>
      </form>

      {mensaje && (
        <p style={{ color: "green" }}>
          {mensaje}
        </p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}
    </section>
  );
}

export default CambiarPassword;

