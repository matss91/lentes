import { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Checkout.css";
function Checkout({
  carrito,
  total,
  cantidadTotal,
  linkMercadoPago,
  onVolver,
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function continuarAlPago(e) {
    e.preventDefault();

    if (
      !nombre.trim() ||
      !email.trim() ||
      !telefono.trim() ||
      !direccion.trim()
    ) {
      alert("Completá todos los datos.");
      return;
    }

    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    setEnviando(true);

    const productosTexto = carrito
      .map(
        (producto) =>
          `${producto.nombre} × ${producto.cantidad} — $${(
            producto.precio * producto.cantidad
          ).toLocaleString("es-AR")}`
      )
      .join("\n");

    const datosPedido = {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      productos: productosTexto,
      total: `$${total.toLocaleString("es-AR")}`,
      cantidad: cantidadTotal,
    };

    try {
      // =====================================
      // 1. ENVIAR PEDIDO POR EMAILJS
      // =====================================

      await emailjs.send(
        "service_4cgf46y",
        "template_j3294ch",
        datosPedido,
        "S8765mw_mc9-6_MSO"
      );

      // =====================================
      // 2. VERIFICAR LINK DE MERCADO PAGO
      // =====================================

      if (!linkMercadoPago) {
        alert(
          `El pedido fue registrado correctamente, pero no existe un link de Mercado Pago configurado para ${cantidadTotal} producto(s).`
        );

        return;
      }

      // =====================================
      // 3. CONFIRMAR PAGO
      // =====================================

      const confirmar = window.confirm(
        `Pedido enviado correctamente.\n\n` +
          `Productos: ${cantidadTotal}\n` +
          `Total: $${total.toLocaleString("es-AR")}\n\n` +
          `¿Querés continuar a Mercado Pago?`
      );

      if (!confirmar) {
        return;
      }

      // =====================================
      // 4. IR A MERCADO PAGO
      // =====================================

      window.location.href = linkMercadoPago;
    } catch (error) {
      console.error("Error EmailJS:", error);

      alert(
        "No se pudo enviar el pedido.\n\n" +
          "No vamos a enviarte a Mercado Pago hasta que el pedido se registre correctamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="checkout">

      <button
        type="button"
        onClick={onVolver}
      >
        ← Volver al carrito
      </button>

      <h1>Datos del cliente</h1>

      <form onSubmit={continuarAlPago}>

        <label>
          Nombre
        </label>

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
        />

        <label>
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />

        <label>
          Teléfono
        </label>

        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Tu teléfono"
        />

        <label>
          Dirección
        </label>

        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Tu dirección"
        />

        <h2>Resumen del pedido</h2>

        {carrito.map((producto) => (
          <div key={producto.id}>
            <span>
              {producto.nombre} × {producto.cantidad}
            </span>

            <strong>
              $
              {(
                producto.precio * producto.cantidad
              ).toLocaleString("es-AR")}
            </strong>
          </div>
        ))}

        <hr />

        <h2>
          Total: ${total.toLocaleString("es-AR")}
        </h2>

        <button
          type="submit"
          disabled={enviando}
        >
          {enviando
            ? "Enviando pedido..."
            : "Enviar pedido y continuar al pago"}
        </button>

      </form>

    </section>
  );
}

export default Checkout;