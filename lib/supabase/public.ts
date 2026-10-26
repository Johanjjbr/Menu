import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";
import { getSupabaseEnv } from "./env";

/**
 * Cliente "anónimo" para la vista pública /menu.
 *
 * No lee cookies ni sesión: consulta como un visitante cualquiera, así
 * que solo puede hacer lo que permiten las políticas de lectura pública.
 */
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
