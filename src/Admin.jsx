import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Admin() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenes, setImagenes] = useState([null]);
const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

useEffect(() => {
  cargarProductos();
}, []);

async function cargarProductos() {
  try {
    const respuesta = await fetch(`${API_URL}/api/productos`);

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.mensaje || "No se pudieron cargar los productos.");
    }

    setProductos(data.productos || []);
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

  function cambiarImagen(index, archivo) {
    const nuevasImagenes = [...imagenes];
    nuevasImagenes[index] = archivo;
    setImagenes(nuevasImagenes);
  }

  function agregarCampoImagen() {
    if (imagenes.length < 4) {
      setImagenes([...imagenes, null]);
    }
  }

  function eliminarCampoImagen(index) {
    if (imagenes.length > 1) {
      setImagenes(imagenes.filter((_, i) => i !== index));
    }
  }

  async function convertirArchivoABase64(archivo) {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();

      lector.onload = () => resolve(lector.result);
      lector.onerror = () =>
        reject(new Error("No se pudo leer la imagen."));

      lector.readAsDataURL(archivo);
    });
  }

  async function subirImagen(archivo, token) {
    const base64 = await convertirArchivoABase64(archivo);

    const respuesta = await fetch(`${API_URL}/api/subir-imagen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imagen: base64,
        nombreArchivo: archivo.name,
        tipo: archivo.type,
      }),
    });

    const texto = await respuesta.text();

    let data;

    try {
      data = JSON.parse(texto);
    } catch {
      throw new Error(
        "El servidor no devolvió una respuesta JSON válida."
      );
    }

    if (!respuesta.ok) {
      throw new Error(data.mensaje || "No se pudo subir la imagen.");
    }

    return data.url;
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

    try {
      const archivos = imagenes.filter(Boolean);

      if (archivos.length === 0) {
        throw new Error("Seleccioná al menos una imagen.");
      }

      setMensaje("Subiendo imágenes...");

      const urlsImagenes = [];

      for (const archivo of archivos) {
        if (!archivo.type.startsWith("image/")) {
          throw new Error(
            `${archivo.name} no es una imagen válida.`
          );
        }

        if (archivo.size > 5 * 1024 * 1024) {
          throw new Error(
            `${archivo.name} supera el límite de 5 MB.`
          );
        }

        const url = await subirImagen(archivo, token);
        urlsImagenes.push(url);
      }

      setMensaje("Guardando producto...");

      const producto = {
        nombre: nombre.trim(),
        precio: Number(precio),
        descripcion: descripcion.trim(),
        imagenes: urlsImagenes,
      };

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
        throw new Error(
          "El servidor no devolvió una respuesta JSON válida."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          data.mensaje || "No se pudo agregar el producto."
        );
      }

      setMensaje("Producto agregado correctamente.");

      setNombre("");

      setMensaje("Producto agregado correctamente.");

await cargarProductos();

setNombre("");

      setPrecio("");
      setDescripcion("");
      setImagenes([null]);

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
                type="file"
                accept="image/*"
                onChange={(e) =>
                  cambiarImagen(index, e.target.files[0] || null)
                }
                required={index === 0}
              />

              {imagen && (
                <span style={{ marginLeft: "10px" }}>
                  {imagen.name}
                </span>
              )}

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

      <h2>Productos existentes</h2>

{productos.length === 0 ? (
  <p>No hay productos cargados.</p>
) : (
  productos.map((producto) => (
    <div
      key={producto.id}
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        marginBottom: "15px",
      }}
    >
      <h3>{producto.nombre}</h3>

      <p>Precio: ${producto.precio}</p>

      <p>{producto.descripcion}</p>

      <p>
        Imágenes: {producto.imagenes?.length || 0}
      </p>

      <button type="button">
        Editar
      </button>

      <button
        type="button"
        style={{ marginLeft: "10px" }}
      >
        Eliminar
      </button>
    </div>
  ))
)}
    </div>
  );
}

export default Admin;