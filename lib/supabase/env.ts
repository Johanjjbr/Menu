/**
 * Lee y valida las variables de entorno de Supabase.
 *
 * Acepta la clave nueva ("publishable", sb_publishable_...) o la legacy
 * ("anon", eyJ...). Ambas son públicas: la seguridad real la dan las
 * políticas RLS definidas en supabase/migrations.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan variables de Supabase. Copien .env.example a .env.local y completen " +
        "NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, key };
}

/** Nombre del bucket de Storage donde se guardan las fotos. */
export const PRODUCT_IMAGES_BUCKET = "product-images";
