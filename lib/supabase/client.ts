import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";

/**
 * Cliente de Supabase para Client Components ("use client").
 * Lo usamos para subir imágenes directo a Storage desde el navegador,
 * así las fotos no pasan por el servidor de Next.js (más rápido y sin
 * límite de tamaño de las Server Actions).
 *
 * Las variables se leen de forma literal para que Next.js las incruste
 * en el bundle del navegador.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
  );
}
