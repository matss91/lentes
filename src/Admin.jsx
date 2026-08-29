
import { useState } from "react";

function Admin() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [imagenes, setImagenes] = useState([""]);

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

  function agregarProducto(e) {
    e.preventDefault();

    const imagenesFiltradas = imagenes.filter(
      (imagen) => imagen.trim() !== ""
    );

    const producto = {
      nombre: nombre.trim(),
      precio: Number(precio),
      descripcion: descripcion.trim(),
      imagenes: imagenesFiltradas,
    };

    console.log("Producto a agregar:", producto);

    alert("Producto preparado correctamente");

    setNombre("");
    setPrecio("");
    setDescripcion("");
    setImagenes([""]);
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

        <button type="submit">
          Agregar anteojo
        </button>
      </form>
    </div>
  );
}

export default Admin;

