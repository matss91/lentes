import { useState } from "react";
import "./App.css";
import ProductoDetalle from "./ProductoDetalle";
import Checkout from "./Checkout";

const PRECIO = 120000;

const productos = [
  {
    id: 1,
    nombre: "Balenciaga",
    precio: PRECIO,
    descripcion:
      "Precisión arquitectónica con energía vibrante. Descubrí elegancia diseñada para tu mirada.",
    imagenes: [
      "/anteojos/1.jpg",
      "/anteojos/1-2.jpg",
      "/anteojos/1-3.jpg",
      "/anteojos/1-4.jpg",
    ],
  },

  {
    id: 2,
    nombre: "Burberry",
    precio: PRECIO,
    descripcion:
      "Precisión arquitectónica con energía vibrante. Descubrí elegancia diseñada para tu mirada.",
    imagenes: [
      "/anteojos/2.jpg",
      "/anteojos/2-2.jpg",
      "/anteojos/2-3.jpg",
    ],
  },

  {
    id: 3,
    nombre: "Chanel",
    precio: PRECIO,
    descripcion:
      "Precisión arquitectónica con energía vibrante. Descubrí elegancia diseñada para tu mirada.",
    imagenes: [
      "/anteojos/3.jpg",
      "/anteojos/3-2.jpg",
      "/anteojos/3-3.jpg",
    ],
  },

  {
    id: 4,
    nombre: "Christian Dior",
    precio: PRECIO,
    descripcion:
      "Precisión arquitectónica con energía vibrante. Descubrí elegancia diseñada para tu mirada.",
    imagenes: [
      "/anteojos/4.jpg",
      "/anteojos/4-2.jpg",
      "/anteojos/4-3.jpg",
    ],
  },

  {
    id: 5,
    nombre: "Versace",
    precio: PRECIO,
    descripcion:
      "Precisión arquitectónica con energía vibrante. Descubrí elegancia diseñada para tu mirada.",
    imagenes: [
      "/anteojos/5.jpg",
      "/anteojos/5-2.jpg",
      "/anteojos/5-3.jpg",
      "/anteojos/5-4.jpg",
    ],
  },

  {
    id: 6,
    nombre: "Gucci",
    precio: PRECIO,
    descripcion:
      "Precisión arquitectónica con energía vibrante. Descubrí elegancia diseñada para tu mirada.",
    imagenes: [
      "/anteojos/6.jpg",
      "/anteojos/6-2.jpg",
      "/anteojos/6-3.jpg",
    ],
  },

  {
    id: 7,
    nombre: "Lacoste",
    precio: PRECIO,
    descripcion:
      "Precisión arquitectónica con energía vibrante. Descubrí elegancia diseñada para tu mirada.",
    imagenes: [
      "/anteojos/7.jpg",
      "/anteojos/7-2.jpg",
      "/anteojos/7-3.jpg",
      "/anteojos/7-4.jpg",
    ],
  },

  {
    id: 8,
    nombre: "Louis Vuitton",
    precio: PRECIO,
    descripcion:
      "Precisión arquitectónica con energía vibrante. Descubrí elegancia diseñada para tu mirada.",
    imagenes: [
      "/anteojos/8.jpg",
      "/anteojos/8-2.jpg",
      "/anteojos/8-3.jpg",
      "/anteojos/8-4.jpg",
    ],
  },

  {
    id: 9,
    nombre: "MIU MIU",
    precio: PRECIO,
    descripcion:
      "Precisión arquitectónica con energía vibrante. Descubrí elegancia diseñada para tu mirada.",
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
    descripcion:
      "Anteojo de diseño moderno y versátil, perfecto para completar diferentes estilos.",
    imagenes: [
      "/anteojos/10.jpg",
      "/anteojos/10-2.jpg",
      "/anteojos/10-3.jpg",
    ],
  },
];

/*
  Mercado Pago según CANTIDAD TOTAL
  de unidades en el carrito.
*/

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

  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);

  const [mostrarCheckout, setMostrarCheckout] =
    useState(false);

  // ==========================================
  // AGREGAR AL CARRITO
  // ==========================================

  function agregarAlCarrito(producto) {
    setCarrito((carritoActual) => {
      const productoExistente = carritoActual.find(
        (item) => item.id === producto.id
      );

      if (productoExistente) {
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

  // ==========================================
  // QUITAR UNA UNIDAD
  // ==========================================

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

  // ==========================================
  // ELIMINAR PRODUCTO
  // ==========================================

  function eliminarDelCarrito(id) {
    setCarrito((carritoActual) =>
      carritoActual.filter(
        (item) => item.id !== id
      )
    );
  }

  // ==========================================
  // CANTIDAD TOTAL
  // ==========================================

  const cantidadTotal = carrito.reduce(
    (cantidad, producto) =>
      cantidad + producto.cantidad,
    0
  );

  // ==========================================
  // PRECIO TOTAL
  // ==========================================

  const total = carrito.reduce(
    (totalCarrito, producto) =>
      totalCarrito +
      producto.precio * producto.cantidad,
    0
  );

  // ==========================================
  // FINALIZAR COMPRA
  // ==========================================

  function pagar() {
    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const linkPago =
      linksMercadoPago[cantidadTotal];

    if (!linkPago) {
      alert(
        `Todavía no configuramos el Link de Mercado Pago para ${cantidadTotal} anteojo(s).`
      );

      return;
    }

    setMostrarCheckout(true);
  }

  // ==========================================
  // CHECKOUT
  // ==========================================

  if (mostrarCheckout) {
    return (
      <Checkout
        carrito={carrito}
        total={total}
        cantidadTotal={cantidadTotal}
        linkMercadoPago={
          linksMercadoPago[cantidadTotal]
        }
        onVolver={() =>
          setMostrarCheckout(false)
        }
      />
    );
  }

  // ==========================================
  // AGREGAR DESDE EL DETALLE
  // ==========================================

  function agregarDesdeDetalle(producto) {
    agregarAlCarrito(producto);

    // Volver al listado.
    setProductoSeleccionado(null);
  }

  // ==========================================
  // VISTA PRINCIPAL
  // ==========================================

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

      {/* =====================================
          DETALLE DEL PRODUCTO
      ====================================== */}

      {productoSeleccionado ? (

        <ProductoDetalle
          producto={productoSeleccionado}

          onVolver={() =>
            setProductoSeleccionado(null)
          }

          onAgregar={agregarDesdeDetalle}
        />

      ) : (

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
                >

                  {/* IMAGEN */}

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

                    {/* VER DETALLE */}

                    <button
                      type="button"
                      onClick={() =>
                        setProductoSeleccionado(
                          producto
                        )
                      }
                    >
                      Ver detalle
                    </button>

                    {/* AGREGAR DIRECTAMENTE */}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        agregarAlCarrito(producto);
                      }}
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

      {/* =====================================
          CARRITO
      ====================================== */}

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
                        type="button"
                        onClick={() =>
                          agregarAlCarrito(
                            producto
                          )
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
                    ).toLocaleString(
                      "es-AR"
                    )}
                  </strong>

                  <button
                    type="button"
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

            {/* TOTAL */}

            <div className="total">

              <span>
                Total
              </span>

              <strong>
                $
                {total.toLocaleString(
                  "es-AR"
                )}
              </strong>

            </div>

            {/* FINALIZAR */}

            <button
              type="button"
              className="pagar"
              onClick={pagar}
            >
              Finalizar compra
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
            Instagram
          </a>

        </div>

      </footer>

    </div>
  );
}

export default App;