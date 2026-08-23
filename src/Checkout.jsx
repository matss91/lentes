import { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Checkout.css";
import { PAQUETE_ANTEOJO } from "./productos";
import { crearPago } from "./services/mercadoPago";
const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL =", import.meta.env.VITE_API_URL);
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
  const [codigoPostal, setCodigoPostal] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [calculandoEnvio, setCalculandoEnvio] = useState(false);

  // ==========================================
  // CALCULAR ENVÍO
  // ==========================================

  async function calcularCostoEnvio() {
    if (!codigoPostal.trim()) {
      alert("Ingresá tu código postal.");
      return;
    }

    setCalculandoEnvio(true);

    try {
      const pesoTotal =
        PAQUETE_ANTEOJO.peso * cantidadTotal;

      const respuesta = await fetch(
        `${API_URL}/api/cotizar-envio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            codigoPostal: codigoPostal.trim(),
            peso: pesoTotal,
            alto: PAQUETE_ANTEOJO.alto,
            ancho: PAQUETE_ANTEOJO.ancho,
            largo: PAQUETE_ANTEOJO.largo,
          }),
        }
      );

      const datos = await respuesta.json();

      console.log("Respuesta del backend:", datos);

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "Error calculando envío"
        );
      }

      if (
        !datos.envio ||
        typeof datos.envio.precio !== "number"
      ) {
        throw new Error(
          "El backend no devolvió un precio de envío válido."
        );
      }

      setCostoEnvio(datos.envio.precio);

      alert(
        `Envío calculado: $${datos.envio.precio.toLocaleString(
          "es-AR"
        )}`
      );
    } catch (error) {
      console.error("Error calculando envío:", error);

      alert("No se pudo consultar el envío.");
    } finally {
      setCalculandoEnvio(false);
    }
  }

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
    // PRODUCTOS PARA EMAILJS
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

    const totalConEnvio = total + costoEnvio;

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
      // 2. CONFIRMAR PAGO
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
      // 3. CREAR PAGO DINÁMICO
      // ==========================================

      const pago = await crearPago(
        carrito,
        costoEnvio
      );

      if (!pago.ok || !pago.link) {
        throw new Error(
          "Mercado Pago no devolvió un link de pago."
        );
      }

      // ==========================================
      // 4. IR A MERCADO PAGO
      // ==========================================

      window.location.href = pago.link;

    } catch (error) {
      console.error(
        "Error en el checkout:",
        error
      );

      alert(
        "No se pudo completar el pedido o crear el pago.\n\n" +
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

        <button
          type="button"
          onClick={calcularCostoEnvio}
          disabled={calculandoEnvio}
        >
          {calculandoEnvio
            ? "Calculando envío..."
            : "Calcular envío"}
        </button>

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

        <p>
          Envío:{" "}
          <strong>
            ${costoEnvio.toLocaleString("es-AR")}
          </strong>
        </p>

        <h2>
          Total: $
          {(total + costoEnvio).toLocaleString(
            "es-AR"
          )}
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