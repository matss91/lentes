

import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Admin() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenes, setImagenes] = useState([""]);

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  function cambiarImagen(index, valor) {
    const nuevasImagenes = [...imagenes];
    nuevasImagenes[index] = valor;
    setImagenes(nuevasImagenes);
  }

  function agregarCampoImagen() {
    if (imagenes.length < 4) {
      setImagenes([...imagenes, ""]);
    }
  }

  function eliminarCampoImagen(index) {
    if (imagenes.length > 1) {
      setImagenes(imagenes.filter((_, i) => i !== index));
    }
  }

  async function agregarProducto(e) {
    e.preventDefault();

    setMensaje("");
    setCargando(true);

   const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setMensaje("No hay sesión de administrador.");
      setCargando(false);
      return;
    }

    const imagenesFiltradas = imagenes
      .map((imagen) => imagen.trim())
      .filter(Boolean);

    const producto = {
      nombre: nombre.trim(),
      precio: Number(precio),
      descripcion: descripcion.trim(),
      imagenes: imagenesFiltradas,
    };

    try {
      const respuesta = await fetch(`${API_URL}/api/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(producto),
      });

      const texto = await respuesta.text();

      let data;

      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error("El servidor no devolvió una respuesta JSON válida.");
      }

      if (!respuesta.ok) {
        throw new Error(data.mensaje || "No se pudo agregar el producto.");
      }

      setMensaje("Producto agregado correctamente.");

      setNombre("");
      setPrecio("");
      setDescripcion("");
      setImagenes([""]);
    } catch (error) {
      console.error("Error agregando producto:", error);
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <h1>Panel de administrador</h1>

      <p>Login correcto. Estás dentro del panel.</p>

      <h2>Agregar anteojo</h2>

      <form onSubmit={agregarProducto}>
        <div>
          <label>Nombre</label>
          <br />
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Ray-Ban"
            required
          />
        </div>

        <br />

        <div>
          <label>Precio</label>
          <br />
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="120000"
            min="0"
            required
          />
        </div>

        <br />

        <div>
          <label>Descripción</label>
          <br />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción del anteojo"
            required
          />
        </div>

        <br />

        <div>
          <label>Imágenes</label>

          {imagenes.map((imagen, index) => (
            <div key={index} style={{ marginTop: "10px" }}>
              <input
                type="text"
                value={imagen}
                onChange={(e) =>
                  cambiarImagen(index, e.target.value)
                }
                placeholder={`/anteojos/${index + 1}.jpg`}
                required={index === 0}
              />

              {imagenes.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarCampoImagen(index)}
                  style={{ marginLeft: "5px" }}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}

          {imagenes.length < 4 && (
            <button
              type="button"
              onClick={agregarCampoImagen}
              style={{ marginTop: "10px" }}
            >
              + Agregar otra imagen
            </button>
          )}
        </div>

        <br />

        <button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Agregar anteojo"}
        </button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default Admin;

