import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { restaurant } from "@/lib/config";
import "./globals.css";

/*
 * Fuentes incluidas en el proyecto (paquetes @fontsource-variable) en
 * lugar de descargarlas de Google Fonts al compilar: el build no depende
 * de internet y no se hacen requests a terceros.
 */

// Bitter: slab con aire de pizarra, para títulos.
const bitter = localFont({
  src: "../node_modules/@fontsource-variable/bitter/files/bitter-latin-wght-normal.woff2",
  variable: "--font-bitter",
  weight: "100 900",
  display: "swap",
});

// Figtree: sans limpia y muy legible en pantallas chicas, para el texto.
const figtree = localFont({
  src: "../node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2",
  variable: "--font-figtree",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${restaurant.name} · Menú`,
    template: `%s · ${restaurant.name}`,
  },
  description: `La carta de ${restaurant.name}, actualizada en el momento.`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#10241d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${bitter.variable} ${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
