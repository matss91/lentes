import { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Checkout.css";

import {
  PAQUETE_ANTEOJO,
  calcularVolumen,
  calcularPesoTotal,
} from "./envio";

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
  const [codigoPostal, setCodigoPostal] = useState("");

  const [enviando, setEnviando] = useState(false);

  // ==========================================
  // DATOS DEL PAQUETE
  // ==========================================

  const pesoTotal = calcularPesoTotal(cantidadTotal);

  const volumen = calcularVolumen();

  // ==========================================
  // ENVÍO PROVISORIO
  // ==========================================
  // Más adelante reemplazamos esto por
  // el cálculo real de Correo Argentino.

  const costoEnvio = codigoPostal.trim()
    ? 8500
    : 0;

  const totalConEnvio = total + costoEnvio;

  // ==========================================
  // CONTINUAR AL PAGO
  // ==========================================

  async function continuarAlPago(e) {
    e.preventDefault();

    if (
      !nombre.trim() ||
      !email.trim() ||
      !telefono.trim() ||
      !direccion.trim() ||
      !codigoPostal.trim()
    ) {
      alert("Completá todos los datos.");
      return;
    }

    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    setEnviando(true);

    // ==========================================
    // PRODUCTOS
    // ==========================================

    const productosTexto = carrito
      .map(
        (producto) =>
          `${producto.nombre} × ${producto.cantidad} — $${(
            producto.precio * producto.cantidad
          ).toLocaleString("es-AR")}`
      )
      .join("\n");

    // ==========================================
    // DATOS DEL PEDIDO
    // ==========================================

    const datosPedido = {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      codigo_postal: codigoPostal.trim(),

      productos: productosTexto,

      subtotal: `$${total.toLocaleString("es-AR")}`,

      envio: `$${costoEnvio.toLocaleString("es-AR")}`,

      total: `$${totalConEnvio.toLocaleString("es-AR")}`,

      cantidad: cantidadTotal,

      peso: `${pesoTotal} g`,

      largo: `${PAQUETE_ANTEOJO.largo} cm`,
      ancho: `${PAQUETE_ANTEOJO.ancho} cm`,
      alto: `${PAQUETE_ANTEOJO.alto} cm`,

      volumen: `${volumen} cm³`,
    };

    try {
      // ==========================================
      // 1. EMAILJS
      // ==========================================

      await emailjs.send(
        "service_4cgf46y",
        "template_j3294ch",
        datosPedido,
        "S8765mw_mc9-6_MSO"
      );

      // ==========================================
      // 2. VERIFICAR MERCADO PAGO
      // ==========================================

      if (!linkMercadoPago) {
        alert(
          `El pedido fue registrado correctamente, pero no existe un link de Mercado Pago configurado para ${cantidadTotal} producto(s).`
        );

        return;
      }

      // ==========================================
      // 3. CONFIRMAR PAGO
      // ==========================================

      const confirmar = window.confirm(
        `Pedido enviado correctamente.\n\n` +
          `Productos: ${cantidadTotal}\n` +
          `Subtotal: $${total.toLocaleString("es-AR")}\n` +
          `Envío: $${costoEnvio.toLocaleString("es-AR")}\n` +
          `TOTAL: $${totalConEnvio.toLocaleString("es-AR")}\n\n` +
          `¿Querés continuar a Mercado Pago?`
      );

      if (!confirmar) {
        return;
      }

      // ==========================================
      // 4. MERCADO PAGO
      // ==========================================

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

        {/* =====================================
            DATOS DEL CLIENTE
        ====================================== */}

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

        <label>
          Código Postal
        </label>

        <input
          type="text"
          value={codigoPostal}
          onChange={(e) =>
            setCodigoPostal(e.target.value)
          }
          placeholder="Ej: 1825"
        />

        {/* =====================================
            DATOS DEL ENVÍO
        ====================================== */}

        <h2>Datos del envío</h2>

        <div className="datosEnvio">

          <p>
            <strong>Cantidad:</strong>{" "}
            {cantidadTotal} anteojo(s)
          </p>

          <p>
            <strong>Peso:</strong>{" "}
            {pesoTotal} g
          </p>

          <p>
            <strong>Medidas:</strong>{" "}
            {PAQUETE_ANTEOJO.largo} ×{" "}
            {PAQUETE_ANTEOJO.ancho} ×{" "}
            {PAQUETE_ANTEOJO.alto} cm
          </p>

          <p>
            <strong>Volumen:</strong>{" "}
            {volumen} cm³
          </p>

        </div>

        {/* =====================================
            RESUMEN
        ====================================== */}

        <h2>Resumen del pedido</h2>

        {carrito.map((producto) => (

          <div key={producto.id}>

            <span>
              {producto.nombre} ×{" "}
              {producto.cantidad}
            </span>

            <strong>
              $
              {(
                producto.precio *
                producto.cantidad
              ).toLocaleString("es-AR")}
            </strong>

          </div>

        ))}

        <hr />

        <p>
          Subtotal:{" "}
          <strong>
            ${total.toLocaleString("es-AR")}
          </strong>
        </p>

        <p>
          Envío:{" "}
          <strong>
            ${costoEnvio.toLocaleString("es-AR")}
          </strong>
        </p>

        <h2>
          Total: $
          {totalConEnvio.toLocaleString("es-AR")}
        </h2>

        {/* =====================================
            PAGAR
        ====================================== */}

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