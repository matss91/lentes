import { useState } from "react";
import "./App.css";
import ProductoDetalle from "./ProductoDetalle";

const PRECIO = 120000;

const productos = [
  {
    id: 1,
    nombre: "Anteojo Classic",
    precio: PRECIO,
    imagenes: [
      "/anteojos/1.jpg",
      "/anteojos/1-2.jpg",
      "/anteojos/1-3.jpg",
    ],
  },
  {
    id: 2,
    nombre: "Anteojo Black",
    precio: PRECIO,
    imagenes: [
      "/anteojos/2.jpg",
      "/anteojos/2-2.jpg",
      "/anteojos/2-3.jpg",
    ],
  },
  {
    id: 3,
    nombre: "Anteojo Brown",
    precio: PRECIO,
    imagenes: [
      "/anteojos/3.jpg",
      "/anteojos/3-2.jpg",
      "/anteojos/3-3.jpg",
    ],
  },
  {
    id: 4,
    nombre: "Anteojo Retro",
    precio: PRECIO,
    imagenes: [
      "/anteojos/4.jpg",
      "/anteojos/4-2.jpg",
      "/anteojos/4-3.jpg",
    ],
  },
  {
    id: 5,
    nombre: "Anteojo Urban",
    precio: PRECIO,
    imagenes: [
      "/anteojos/5.jpg",
      "/anteojos/5-2.jpg",
      "/anteojos/5-3.jpg",
    ],
  },
  {
    id: 6,
    nombre: "Classic Black",
    precio: PRECIO,
    imagenes: [
      "/anteojos/6.jpg",
      "/anteojos/6-2.jpg",
      "/anteojos/6-3.jpg",
    ],
  },
  {
    id: 7,
    nombre: "Anteojo Sun",
    precio: PRECIO,
    imagenes: [
      "/anteojos/7.jpg",
      "/anteojos/7-2.jpg",
      "/anteojos/7-3.jpg",
    ],
  },
  {
    id: 8,
    nombre: "Anteojo Premium",
    precio: PRECIO,
    imagenes: [
      "/anteojos/8.jpg",
      "/anteojos/8-2.jpg",
      "/anteojos/8-3.jpg",
    ],
  },
  {
    id: 9,
    nombre: "Anteojo Sport",
    precio: PRECIO,
    imagenes: [
      "/anteojos/9.jpg",
      "/anteojos/9-2.jpg",
      "/anteojos/9-3.jpg",
    ],
  },
  {
    id: 10,
    nombre: "Anteojo Modern",
    precio: PRECIO,
    imagenes: [
      "/anteojos/10.jpg",
      "/anteojos/10-2.jpg",
      "/anteojos/10-3.jpg",
    ],
  },
];

// Links de Mercado Pago
const linksMercadoPago = {
  1: "https://mpago.la/2xrixb4",
  2: "https://mpago.la/2ud4sWC",
  3: "https://mpago.la/2wiLtjU",
  4: "https://mpago.la/2bTBcVF",
  5: "https://mpago.la/1RaZC5X",
  6: "https://mpago.la/31x9U1r",
  7: "https://mpago.la/25QSiBc",
  8: "https://mpago.la/2T9k8Xt",
  9: "https://mpago.la/2bbbNTQ",
  10: "https://mpago.la/21iPYeD",
};

function App() {
  const [carrito, setCarrito] = useState([]);

  // Producto que estamos viendo
  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);

  // Agregar producto al carrito
  function agregarAlCarrito(producto) {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find(
        (item) => item.id === producto.id
      );

      if (existe) {
        return carritoActual.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
              }
            : item
        );
      }

      return [
        ...carritoActual,
        {
          ...producto,
          cantidad: 1,
        },
      ];
    });
  }

  // Restar una unidad
  function quitarDelCarrito(id) {
    setCarrito((carritoActual) =>
      carritoActual
        .map((item) =>
          item.id === id
            ? {
                ...item,
                cantidad: item.cantidad - 1,
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  }

  // Eliminar producto completo
  function eliminarDelCarrito(id) {
    setCarrito((carritoActual) =>
      carritoActual.filter(
        (item) => item.id !== id
      )
    );
  }

  // Cantidad total
  const cantidadTotal = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  // Precio total
  const total = cantidadTotal * PRECIO;

  // Pagar
  function pagar() {
    if (cantidadTotal === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const link = linksMercadoPago[cantidadTotal];

    if (!link) {
      alert(
        `Todavía no configuramos el Link de Mercado Pago para ${cantidadTotal} anteojo(s).`
      );
      return;
    }

    window.location.href = link;
  }

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">

        <div className="logo">
          LENTES
        </div>

        <div className="carrito">
          🛒 {cantidadTotal}
        </div>

      </header>

      {/* SI HAY UN PRODUCTO SELECCIONADO */}
      {productoSeleccionado ? (

        <ProductoDetalle
          producto={productoSeleccionado}

          onVolver={() =>
            setProductoSeleccionado(null)
          }

          onAgregar={agregarAlCarrito}
        />

      ) : (

        /* SI NO HAY PRODUCTO SELECCIONADO */
        <>

          {/* HERO */}
          <section className="hero">

            <h1>
              Anteojos que van con vos
            </h1>

            <p>
              Todos nuestros modelos a $
              {PRECIO.toLocaleString("es-AR")}
            </p>

            <a
              href="#productos"
              className="heroButton"
            >
              Ver productos
            </a>

          </section>

          {/* PRODUCTOS */}
          <main id="productos">

            <h2>
              Nuestros anteojos
            </h2>

            <div className="productos">

              {productos.map((producto) => (

                <div
                  className="producto"
                  key={producto.id}

                  onClick={() =>
                    setProductoSeleccionado(producto)
                  }
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
                      {PRECIO.toLocaleString("es-AR")}
                    </p>

                   <button
  onClick={() =>
    setProductoSeleccionado(producto)
  }
>
  Ver detalle
</button>

<button
  onClick={() =>
    agregarAlCarrito(producto)
  }
>
  Agregar al carrito
</button>

                  </div>

                </div>

              ))}

            </div>

          </main>

        </>

      )}

      {/* CARRITO */}
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
                        onClick={() =>
                          quitarDelCarrito(
                            producto.id
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {producto.cantidad}
                      </span>

                      <button
                        onClick={() =>
                          agregarAlCarrito(producto)
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <strong>
                    $
                    {(
                      PRECIO *
                      producto.cantidad
                    ).toLocaleString("es-AR")}
                  </strong>

                  <button
                    className="eliminar"
                    onClick={() =>
                      eliminarDelCarrito(
                        producto.id
                      )
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
              className="pagar"
              onClick={pagar}
            >
              Pagar con Mercado Pago
            </button>

          </>

        )}

      </section>

      {/* FOOTER */}
      <footer>

  <p>
    © 2026 LENTES
  </p>

  <p>
    Pagos seguros con Mercado Pago
  </p>

  <div className="redesSociales">

    <a
      href="https://www.facebook.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="redSocial facebook"
    >
      Facebook
    </a>

    <a
      href="https://wa.me/5491100000000"
      target="_blank"
      rel="noopener noreferrer"
      className="redSocial whatsapp"
    >
      WhatsApp
    </a>
    <a
      href="https://www.instagram.com"
      target="_blank"
      rel="noopener noreferrer"
      className="redSocial instagram"
    >
      instagram
    </a>

  </div>

</footer>


    </div>
  );
}

export default App;
