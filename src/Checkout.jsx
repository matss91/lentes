
import { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Checkout.css";
import { crearPago } from "./services/mercadoPago";

function Checkout({
  carrito,
  total,
  cantidadTotal,
  onVolver,
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [enviando, setEnviando] = useState(false);

  // ==========================================
  // CONTINUAR AL PAGO
  // ==========================================

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

    subtotal: `$${total.toLocaleString("es-AR")}`,

    envio: "$0",

    total: `$${total.toLocaleString("es-AR")}`,

    cantidad: cantidadTotal,
  };

  try {
    // ==========================================
    // 1. CREAR PAGO EN MERCADO PAGO
    // ==========================================

    const pago = await crearPago(carrito, 0);

    if (!pago.ok || !pago.link) {
      throw new Error(
        "Mercado Pago no devolvió un link de pago."
      );
    }

    // ==========================================
    // 2. ENVIAR EMAIL
    // ==========================================

   try {
  const respuestaEmail = await emailjs.send(
    "service_4cgf46y",
    "template_j3294ch",
    datosPedido,
    "S8765mw_mc9-6_MSO"
  );

  console.log("EMAIL ENVIADO:", respuestaEmail);

  alert("El pedido fue enviado correctamente por email.");
} catch (emailError) {
  console.error("ERROR COMPLETO DE EMAILJS:", emailError);

  alert(
    "El pedido NO pudo enviarse por email.\n\n" +
    "Código: " + (emailError?.status || "desconocido") +
    "\nMensaje: " + (emailError?.text || emailError?.message || "desconocido")
  );

  return;
}

    // ==========================================
    // 3. IR A MERCADO PAGO
    // ==========================================

    window.location.href = pago.link;

  } catch (error) {
    console.error(
      "Error al crear el pago:",
      error
    );

    alert(
      "No se pudo crear el pago.\n\n" +
      "Revisá la consola para ver el error."
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
          onChange={(e) =>
            setNombre(e.target.value)
          }
          placeholder="Tu nombre"
        />

        <label>
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="tu@email.com"
        />

        <label>
          Teléfono
        </label>

        <input
          type="tel"
          value={telefono}
          onChange={(e) =>
            setTelefono(e.target.value)
          }
          placeholder="Tu teléfono"
        />

        <label>
          Dirección
        </label>

        <input
          type="text"
          value={direccion}
          onChange={(e) =>
            setDireccion(e.target.value)
          }
          placeholder="Tu dirección"
        />

        {/* =====================================
            RESUMEN DEL PEDIDO
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

        <h2>
          Total: $
          {total.toLocaleString("es-AR")}
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

