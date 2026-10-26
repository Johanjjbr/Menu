/**
 * Datos del local que se muestran en la carta. Se configuran con
 * variables de entorno (ver .env.example) para no tocar código.
 */
export const restaurant = {
  name: process.env.NEXT_PUBLIC_RESTAURANT_NAME || "La Carmela",
  tagline: process.env.NEXT_PUBLIC_RESTAURANT_TAGLINE || "Café · Bar",
  /** Número de WhatsApp en formato internacional sin "+" ni espacios: 5492645551234 */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "",
};

/** Link de WhatsApp con un mensaje precargado (o null si no hay número). */
export function whatsappLink(message: string) {
  if (!restaurant.whatsapp) return null;
  return `https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(message)}`;
}
