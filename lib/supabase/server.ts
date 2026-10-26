import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types";
import { getSupabaseEnv } from "./env";

/**
 * Cliente de Supabase para Server Components y Server Actions que
 * necesitan la sesión del usuario (panel /admin).
 *
 * - Lee la sesión desde las cookies del request.
 * - Hay que crear uno nuevo en cada request (nunca compartirlo).
 * - Con Cache Components, cualquier componente que lo use tiene que
 *   estar dentro de un <Suspense>, porque cookies() es dato de request.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // En un Server Component no se pueden escribir cookies. No pasa
          // nada: el proxy (proxy.ts) ya refresca la sesión en cada request.
        }
      },
    },
  });
}
