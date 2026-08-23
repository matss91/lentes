
const API_URL = import.meta.env.VITE_API_URL;

export async function crearPago(productos, envio) {
  const respuesta = await fetch(
    `${ API_URL}/api/crear-preferencia`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productos,
        envio,
      }),
    }
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje || "Error al crear el pago"
    );
  }

  return data;
}