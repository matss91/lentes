
import { useState } from "react";

function ProductoDetalle({
  producto,
  onVolver,
  onAgregar,
}) {
  const [fotoSeleccionada, setFotoSeleccionada] =
    useState(0);

  return (
    <section className="productoDetalle">

      <button
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

            {producto.imagenes.map(
              (imagen, index) => (

                <button
                  key={imagen}
                  className={
                    fotoSeleccionada === index
                      ? "miniatura activa"
                      : "miniatura"
                  }
                  onClick={() =>
                    setFotoSeleccionada(index)
                  }
                >
                  <img
                    src={imagen}
                    alt={`${producto.nombre} ${
                      index + 1
                    }`}
                  />
                </button>

              )
            )}

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
            Anteojos de diseño moderno y cómodo,
            pensados para acompañarte todos los días.
          </p>

          <button
            className="detalleButton"
            onClick={() => onAgregar(producto)}
          >
            Agregar al carrito
          </button>

        </div>

      </div>

    </section>
  );
}

export default ProductoDetalle;
