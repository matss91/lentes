
import { useState } from "react";

function Admin() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState("");
  const [descripcion, setDescripcion] = useState("");

  function agregarProducto(e) {
    e.preventDefault();

    const producto = {
      nombre,
      precio: Number(precio),
      imagen,
      descripcion,
    };

    console.log("Producto a agregar:", producto);

    alert("Producto preparado para agregar");

    setNombre("");
    setPrecio("");
    setImagen("");
    setDescripcion("");
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
            placeholder="Ej: Anteojo Modern"
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
          <label>Imagen</label>
          <br />
          <input
            type="text"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            placeholder="/anteojos/1.jpg"
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

        <button type="submit">
          Agregar anteojo
        </button>
      </form>
    </div>
  );
}

export default Admin;

