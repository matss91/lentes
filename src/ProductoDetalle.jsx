
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

  function obtenerUrlImagen(imagen) {
    if (!imagen) {
      return "";
    }

    // Si ya es una URL de nuestra API, la usamos directamente
    if (imagen.includes("/api/imagen?url=")) {
      return imagen;
    }

    // Si es una URL de Vercel Blob, la pasamos
    // por nuestra API para poder acceder al Blob privado
    if (imagen.includes(".blob.vercel-storage.com")) {
      return `https://lentes-mocha.vercel.app/api/imagen?url=${encodeURIComponent(
        imagen
      )}`;
    }

    // Para imágenes antiguas/locales
    return imagen;
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
            src={obtenerUrlImagen(
              producto.imagenes[fotoSeleccionada]
            )}
            alt={producto.nombre}
          />

          {/* MINIATURAS */}

          <div className="miniaturas">

            {producto.imagenes.map((imagen, index) => (
              <button
                type="button"
                key={`${imagen}-${index}`}
                className={
                  fotoSeleccionada === index
                    ? "miniatura activa"
                    : "miniatura"
                }
                onClick={() => setFotoSeleccionada(index)}
              >
                <img
                  src={obtenerUrlImagen(imagen)}
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

