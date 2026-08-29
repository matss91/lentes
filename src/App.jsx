import { useState, useEffect } from "react";
import "./App.css";
import Productos from "./components/Productos";
import ProductoDetalle from "./ProductoDetalle";
import Checkout from "./Checkout";
const API_URL = import.meta.env.VITE_API_URL;
import Login from "./Login";

import { linksMercadoPago } from "./mercadoPago";
import Carrito from "./Carrito";
function App() {
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarCheckout, setMostrarCheckout] = useState(false);
  const [productos, setProductos] = useState([]);
  <Login onLogin={() => console.log("Login correcto")} />
useEffect(() => {
  fetch(`${API_URL}/api/estado`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Respuesta del backend:", data);
    })
    .catch((error) => {
      console.error("Error conectando con backend:", error);
    });
}, []);

useEffect(() => {
  fetch("/productos.json")
    .then((res) => res.json())
    .then((data) => {
      setProductos(data);
    })
    .catch((error) => {
      console.error("Error cargando productos:", error);
    });
}, []);


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

  function eliminarDelCarrito(id) {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== id)
    );
  }

  const cantidadTotal = carrito.reduce(
    (cantidad, producto) => cantidad + producto.cantidad,
    0
  );

  const total = carrito.reduce(
    (totalCarrito, producto) =>
      totalCarrito + producto.precio * producto.cantidad,
    0
  );

  function pagar() {
    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const linkPago = linksMercadoPago[cantidadTotal];

    if (!linkPago) {
      alert(
        `Todavía no configuramos el Link de Mercado Pago para ${cantidadTotal} anteojo(s).`
      );
      return;
    }

    setMostrarCheckout(true);
  }

  function agregarDesdeDetalle(producto) {
    agregarAlCarrito(producto);
    setProductoSeleccionado(null);
  }

  if (mostrarCheckout) {
    return (
      <Checkout
        carrito={carrito}
        total={total}
        cantidadTotal={cantidadTotal}
        linkMercadoPago={linksMercadoPago[cantidadTotal]}
        onVolver={() => setMostrarCheckout(false)}
      />
    );
  }

  return (
    <div className="app">

      <header className="header">
        <div className="logo">
          LENTES
        </div>

        <div className="carrito">
          🛒 {cantidadTotal}
        </div>
      </header>

      {productoSeleccionado ? (
        <ProductoDetalle
          producto={productoSeleccionado}
          onVolver={() => setProductoSeleccionado(null)}
          onAgregar={agregarDesdeDetalle}
        />
      ) : (
        <>
          <section className="hero">
            <h1>
              Anteojos que van con vos
            </h1>

           <p>
  Todos nuestros modelos a $120.000
</p>
            <a
              href="#productos"
              className="heroButton"
            >
              Ver productos
            </a>
          </section>

<Productos
  productos={productos}
  onVerDetalle={setProductoSeleccionado}
  onAgregar={agregarAlCarrito}
/>
        </>
      )}

   <Carrito
  carrito={carrito}
  total={total}
  onAgregar={agregarAlCarrito}
  onQuitar={quitarDelCarrito}
  onEliminar={eliminarDelCarrito}
  onPagar={pagar}
/>

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