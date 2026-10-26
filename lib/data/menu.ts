import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { CategoryWithProducts } from "@/lib/types";

/**
 * Trae la carta completa: categorías ordenadas, cada una con sus
 * productos ordenados por nombre. Una sola consulta gracias al
 * "embedding" de PostgREST (products(*) dentro de categories).
 *
 * @param onlyWithProducts  si es true, oculta categorías vacías (para /menu)
 */
export async function getMenu({ onlyWithProducts = true } = {}) {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*, products(*)")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .order("title", { referencedTable: "products", ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar el menú: ${error.message}`);
  }

  const menu = (data ?? []) as CategoryWithProducts[];
  return onlyWithProducts ? menu.filter((c) => c.products.length > 0) : menu;
}
