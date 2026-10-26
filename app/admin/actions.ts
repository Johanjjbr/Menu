"use server";

/**
 * Server Actions del panel de administración.
 *
 * Cada acción:
 *  1. Verifica la sesión con requireUser() (no confiamos en el cliente).
 *  2. Valida los datos del formulario.
 *  3. Escribe en Supabase (RLS vuelve a chequear que sea "authenticated").
 *  4. Refresca la UI con refresh() o redirige.
 *
 * /menu no tiene cache (lee en cada visita), así que los cambios se ven
 * en la carta pública de inmediato.
 */

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/env";
import type { ActionState } from "@/lib/types";

// ---------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresá tu email y tu contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Escribí un nombre para la categoría." };

  // La nueva categoría va al final
  const { data: last } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("categories")
    .insert({ name, sort_order: (last?.sort_order ?? 0) + 1 });

  if (error) return { error: `No se pudo crear la categoría: ${error.message}` };
  refresh();
  return { ok: true };
}

export async function renameCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre no puede quedar vacío." };

  const { error } = await supabase.from("categories").update({ name }).eq("id", id);
  if (error) return { error: `No se pudo renombrar: ${error.message}` };
  refresh();
  return { ok: true };
}

/** Sube o baja una categoría un lugar, intercambiando sort_order con la vecina. */
export async function moveCategory(id: string, direction: "up" | "down") {
  const { supabase } = await requireUser();

  const { data: cats } = await supabase
    .from("categories")
    .select("id, sort_order")
    .order("sort_order")
    .order("name");
  if (!cats) return;

  const i = cats.findIndex((c) => c.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= cats.length) return;

  // Re-numeramos 1..n con el intercambio aplicado (evita empates de sort_order)
  [cats[i], cats[j]] = [cats[j], cats[i]];
  await Promise.all(
    cats.map((c, index) =>
      c.sort_order === index + 1
        ? null
        : supabase.from("categories").update({ sort_order: index + 1 }).eq("id", c.id),
    ),
  );
  refresh();
}

export async function deleteCategory(id: string): Promise<ActionState> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    // 23503 = violación de foreign key: todavía tiene productos
    if (error.code === "23503") {
      return { error: "Esta categoría tiene productos. Movelos o borralos primero." };
    }
    return { error: `No se pudo borrar: ${error.message}` };
  }
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------

/** Lee y valida los campos del formulario de producto. */
function parseProduct(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const category_id = String(formData.get("category_id") ?? "");
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = parsePrice(priceRaw);
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const is_available = formData.get("is_available") === "on";

  if (!title) return { error: "Escribí el nombre del producto." } as const;
  if (!category_id) return { error: "Elegí una categoría." } as const;
  if (!priceRaw || Number.isNaN(price) || price < 0) {
    return { error: "Ingresá un precio válido (por ejemplo 12800 o 1250,50)." } as const;
  }

  return { data: { title, description, category_id, price, image_url, is_available } } as const;
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const parsed = parseProduct(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase.from("products").insert(parsed.data);
  if (error) return { error: `No se pudo guardar: ${error.message}` };

  redirect("/admin");
}

export async function updateProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const parsed = parseProduct(formData);
  if ("error" in parsed) return { error: parsed.error };

  // Si cambió la foto, borramos la anterior de Storage
  const { data: before } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
  if (error) return { error: `No se pudo guardar: ${error.message}` };

  if (before?.image_url && before.image_url !== parsed.data.image_url) {
    await removeImage(supabase, before.image_url);
  }

  redirect("/admin");
}

export async function deleteProduct(id: string): Promise<ActionState> {
  const { supabase } = await requireUser();

  const { data: product } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: `No se pudo borrar: ${error.message}` };

  if (product?.image_url) await removeImage(supabase, product.image_url);
  refresh();
  return { ok: true };
}

/** Toggle Disponible / Agotado. */
export async function setAvailability(id: string, isAvailable: boolean): Promise<ActionState> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("products")
    .update({ is_available: isAvailable })
    .eq("id", id);

  if (error) return { error: `No se pudo actualizar: ${error.message}` };
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------
// Utilidades internas
// ---------------------------------------------------------------------

/**
 * Convierte el precio escrito por el usuario a número.
 * Acepta formato argentino y decimal "normal":
 *   "12800" → 12800   "12.800" → 12800   "1.250,50" → 1250.5   "1250.50" → 1250.5
 */
function parsePrice(raw: string) {
  const clean = raw.replace(/[$\s]/g, "");
  if (!clean) return NaN;
  if (clean.includes(",")) {
    // Formato AR: puntos de miles, coma decimal
    return Number(clean.replace(/\./g, "").replace(",", "."));
  }
  if (/^\d{1,3}(\.\d{3})+$/.test(clean)) {
    // "12.800": los puntos son separadores de miles
    return Number(clean.replace(/\./g, ""));
  }
  return Number(clean);
}

/**
 * Borra una foto de Storage a partir de su URL pública.
 * Best-effort: si falla no interrumpe la acción principal.
 */
async function removeImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  publicUrl: string,
) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return; // no es una foto de nuestro bucket

  const path = decodeURIComponent(publicUrl.slice(index + marker.length));
  await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
}
