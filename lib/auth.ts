import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve el cliente de Supabase con sesión y el usuario logueado.
 * Si no hay sesión válida, redirige al login.
 *
 * Se llama al principio de CADA Server Action y página del admin: el
 * proxy es solo un filtro rápido, la autorización real se hace acá
 * (y en las políticas RLS de la base).
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return { supabase, user };
}
