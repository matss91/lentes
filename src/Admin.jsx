import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Admin() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenes, setImagenes] = useState([null]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    try {
      const respuesta = await fetch(`${API_URL}/api/productos`, {
        cache: "no-store",
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data.mensaje || "No se pudieron cargar los productos."
        );
      }

      const listaProductos = Array.isArray(data) ? data : [];

      setProductos(listaProductos);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  }
///obtener vista previa
function obtenerVistaPrevia(imagen) { if (!imagen) return null; return URL.createObjectURL(imagen); }

///




  function cambiarImagen(index, archivo) {
    if (cargando) return;

    const nuevasImagenes = [...imagenes];
    nuevasImagenes[index] = archivo;
    setImagenes(nuevasImagenes);
  }

  function agregarCampoImagen() {
    if (cargando) return;

    if (imagenes.length < 4) {
      setImagenes([...imagenes, null]);
    }
  }

  function eliminarCampoImagen(index) {
    if (cargando) return;

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
      throw new Error(
        data.mensaje || "No se pudo subir la imagen."
      );
    }

    return data.url;
  }

  function editarProducto(producto) {
    if (cargando) return;

    setEditandoId(producto.id);
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setDescripcion(producto.descripcion);
    setImagenesExistentes(producto.imagenes || []);
    setImagenes([null]);
    setMensaje(`Editando: ${producto.nombre}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function eliminarImagenExistente(index) {
    if (cargando) return;

    setImagenesExistentes(
      imagenesExistentes.filter((_, i) => i !== index)
    );
  }

  async function agregarProducto(e) {
    e.preventDefault();

    if (cargando) return;

    setCargando(true);
    setMensaje("");

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

      window.location.reload();
    } catch (error) {
      console.error("Error agregando producto:", error);
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  async function actualizarProducto(e) {
    e.preventDefault();

    if (cargando) return;

    setCargando(true);
    setMensaje("");

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setMensaje("No hay sesión de administrador.");
      setCargando(false);
      return;
    }

    try {
      const productoOriginal = productos.find(
        (producto) =>
          Number(producto.id) === Number(editandoId)
      );

      if (!productoOriginal) {
        throw new Error("No se encontró el producto.");
      }

      let urlsImagenes = [...imagenesExistentes];

      const archivos = imagenes.filter(Boolean);

      if (archivos.length > 0) {
        setMensaje("Subiendo imágenes...");

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
      }

      if (urlsImagenes.length > 4) {
        throw new Error(
          "Un producto puede tener como máximo 4 imágenes."
        );
      }

      setMensaje("Guardando cambios...");

      const productoActualizado = {
        id: editandoId,
        nombre: nombre.trim(),
        precio: Number(precio),
        descripcion: descripcion.trim(),
        imagenes: urlsImagenes,
      };

      const respuesta = await fetch(`${API_URL}/api/productos`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productoActualizado),
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
          data.mensaje || "No se pudo actualizar el producto."
        );
      }

      setMensaje("Producto actualizado correctamente.");

      setEditandoId(null);
      setNombre("");
      setPrecio("");
      setDescripcion("");
      setImagenes([null]);
      setImagenesExistentes([]);

      await cargarProductos();
    } catch (error) {
      console.error("Error actualizando producto:", error);
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarProducto(id) {
    if (cargando) return;

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setMensaje("No hay sesión de administrador.");
      return;
    }

    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este producto?"
    );

    if (!confirmar) return;

    setCargando(true);
    setMensaje("Eliminando producto...");

    try {
      const respuesta = await fetch(`${API_URL}/api/productos`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const texto = await respuesta.text();

      let data;

      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error("El servidor no devolvió JSON válido.");
      }

      if (!respuesta.ok) {
        throw new Error(
          data.mensaje || "No se pudo eliminar el producto."
        );
      }

      setMensaje("Producto eliminado correctamente.");

      await cargarProductos();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <h1>Panel de administrador</h1>

      <p>Login correcto. Estás dentro del panel.</p>

      <h2>
        {editandoId !== null
          ? "Editar anteojo"
          : "Agregar anteojo"}
      </h2>

      <form
        onSubmit={
          editandoId !== null
            ? actualizarProducto
            : agregarProducto
        }
      >
        <div>
          <label>Nombre</label>
          <br />

          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Ray-Ban"
            required
            disabled={cargando}
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
            disabled={cargando}
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
            disabled={cargando}
          />
        </div>

        <br />
<div>
  <label>Imágenes</label>

  {/* IMÁGENES EXISTENTES */}
  {editandoId !== null && (
    <div
      style={{
        marginTop: "15px",
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Imágenes actuales</h3>

      {imagenesExistentes.length === 0 ? (
        <p>No hay imágenes actuales.</p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {imagenesExistentes.map((url, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <img
                src={`${API_URL}/api/imagen?url=${encodeURIComponent(url)}`}
                alt={`Imagen ${index + 1}`}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  display: "block",
                  marginBottom: "10px",
                  borderRadius: "6px",
                }}
              />

              <button
                type="button"
                onClick={() => eliminarImagenExistente(index)}
                disabled={cargando}
                style={{
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                🗑 Eliminar imagen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {/* AGREGAR IMÁGENES */}
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #ccc",
      borderRadius: "8px",
    }}
  >
    <h3 style={{ marginTop: 0 }}>
      {editandoId !== null
        ? "Agregar nuevas imágenes"
        : "Seleccionar imágenes"}
    </h3>

    {imagenes.map((imagen, index) => (
      <div
        key={index}
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "#f5f5f5",
          borderRadius: "6px",
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            cambiarImagen(
              index,
              e.target.files[0] || null
            )
          }
          required={
            editandoId === null && index === 0
          }
          disabled={cargando}
        />

       
{imagen && (
  <div style={{ marginTop: "10px" }}>
    <img
      src={obtenerVistaPrevia(imagen)}
      alt={`Vista previa ${index + 1}`}
      style={{
        width: "150px",
        height: "150px",
        objectFit: "cover",
        borderRadius: "8px",
        border: "1px solid #ccc",
        display: "block",
        marginBottom: "8px",
      }}
    />

    <span>{imagen.name}</span>
  </div>
)}



        {imagenes.length > 1 && (
          <button
            type="button"
            onClick={() =>
              eliminarCampoImagen(index)
            }
            disabled={cargando}
            style={{
              marginLeft: "10px",
              background: "#6c757d",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Quitar
          </button>
        )}
      </div>
    ))}

    {imagenes.length < 4 && (
      <button
        type="button"
        onClick={agregarCampoImagen}
        disabled={cargando}
        style={{
          marginTop: "15px",
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "9px 14px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        ➕ Agregar otra imagen
      </button>
    )}
  </div>
</div>
      

        <br />

        <button type="submit" disabled={cargando}>
          {cargando
            ? "Procesando..."
            : editandoId !== null
              ? "Guardar cambios"
              : "Agregar anteojo"}
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

            <button
              type="button"
              onClick={() => editarProducto(producto)}
              disabled={cargando}
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() =>
                eliminarProducto(producto.id)
              }
              disabled={cargando}
              style={{ marginLeft: "10px" }}
            >
              {cargando ? "Procesando..." : "Eliminar"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;