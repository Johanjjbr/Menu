/**
 * Datos del restaurante que se muestran en la carta.
 * Se configuran con variables de entorno (ver .env.example) para no
 * tener que tocar código si cambia el nombre.
 */
export const restaurant = {
  name: process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Nuestro restaurante",
  tagline: process.env.NEXT_PUBLIC_RESTAURANT_TAGLINE || "",
};
