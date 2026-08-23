function Productos({
  productos,
  onVerDetalle,
  onAgregar,
}) {
  return (
    <main id="productos">

      <h2>
        Nuestros anteojos
      </h2>

      <div className="productos">

        {productos.map((producto) => (
          <div
            className="producto"
            key={producto.id}
          >

            <img
              src={producto.imagenes[0]}
              alt={producto.nombre}
            />

            <div className="productoInfo">

              <h3>
                {producto.nombre}
              </h3>

              <p className="precio">
                $
                {producto.precio.toLocaleString(
                  "es-AR"
                )}
              </p>

              <button
                type="button"
                onClick={() =>
                  onVerDetalle(producto)
                }
              >
                Ver detalle
              </button>

              <button
                type="button"
                onClick={() =>
                  onAgregar(producto)
                }
              >
                Agregar al carrito
              </button>

            </div>

          </div>
        ))}

      </div>

    </main>
  );
}

export default Productos;