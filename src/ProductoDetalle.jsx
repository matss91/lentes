
import { useState } from "react";

function ProductoDetalle({
  producto,
  onVolver,
  onAgregar,
}) {
  const [fotoSeleccionada, setFotoSeleccionada] = useState(0);

  function agregarProducto() {
    onAgregar(producto);
  }

  return (
    <section className="productoDetalle">

      <button
        type="button"
        className="volver"
        onClick={onVolver}
      >
        ← Volver a productos
      </button>

      <div className="detalleContenido">

        <div className="detalleImagen">

          {/* FOTO PRINCIPAL */}

          <img
            src={producto.imagenes[fotoSeleccionada]}
            alt={producto.nombre}
          />

          {/* MINIATURAS */}

          <div className="miniaturas">

            {producto.imagenes.map((imagen, index) => (
              <button
                type="button"
                key={imagen}
                className={
                  fotoSeleccionada === index
                    ? "miniatura activa"
                    : "miniatura"
                }
                onClick={() => setFotoSeleccionada(index)}
              >
                <img
                  src={imagen}
                  alt={`${producto.nombre} ${index + 1}`}
                />
              </button>
            ))}

          </div>

        </div>

        <div className="detalleInfo">

          <h1>
            {producto.nombre}
          </h1>

          <p className="detallePrecio">
            $
            {producto.precio.toLocaleString("es-AR")}
          </p>

          <p className="detalleDescripcion">
            {producto.descripcion}
          </p>

          <button
            type="button"
            className="detalleButton"
            onClick={agregarProducto}
          >
            Agregar al carrito
          </button>

        </div>

      </div>

    </section>
  );
}

export default ProductoDetalle;