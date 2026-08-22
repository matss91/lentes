// envio.js

// Medidas aproximadas de 1 anteojo con su caja
export const PAQUETE_ANTEOJO = {
  largo: 20, // cm
  ancho: 10, // cm
  alto: 8,   // cm
  peso: 300, // gramos
};

// Calcula el volumen de la caja
export function calcularVolumen() {
  return (
    PAQUETE_ANTEOJO.largo *
    PAQUETE_ANTEOJO.ancho *
    PAQUETE_ANTEOJO.alto
  );
}

// Calcula el peso total según cantidad de anteojos
export function calcularPesoTotal(cantidadTotal) {
  return PAQUETE_ANTEOJO.peso * cantidadTotal;
}