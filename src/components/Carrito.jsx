function Carrito({
  carrito,
  total,
  onAgregar,
  onQuitar,
  onEliminar,
  onPagar,
}) {
  return (
    <section className="carritoSection">

      <h2>
        Tu carrito
      </h2>

      {carrito.length === 0 ? (
        <p>
          Todavía no agregaste ningún producto.
        </p>
      ) : (
        <>
          <div className="carritoItems">

            {carrito.map((producto) => (
              <div
                className="carritoItem"
                key={producto.id}
              >

                <div>

                  <strong>
                    {producto.nombre}
                  </strong>

                  <div className="cantidad">

                    <button
                      type="button"
                      onClick={() =>
                        onQuitar(producto.id)
                      }
                    >
                      −
                    </button>

                    <span>
                      {producto.cantidad}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        onAgregar(producto)
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                <strong>
                  $
                  {(
                    producto.precio *
                    producto.cantidad
                  ).toLocaleString("es-AR")}
                </strong>

                <button
                  type="button"
                  className="eliminar"
                  onClick={() =>
                    onEliminar(producto.id)
                  }
                >
                  ✕
                </button>

              </div>
            ))}

          </div>

          <div className="total">

            <span>
              Total
            </span>

            <strong>
              $
              {total.toLocaleString("es-AR")}
            </strong>

          </div>

          <button
            type="button"
            className="pagar"
            onClick={onPagar}
          >
            Finalizar compra
          </button>

        </>
      )}

    </section>
  );
}

export default Carrito;