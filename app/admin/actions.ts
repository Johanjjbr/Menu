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
import { parsePrice } from "@/lib/format";
import {
  CATEGORY_KINDS,
  MENU_GROUPS,
  type ActionState,
  type CategoryKind,
  type MenuGroup,
  type PriceItem,
} from "@/lib/types";

type Supabase = Awaited<ReturnType<typeof createClient>>;

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const optionalText = (formData: FormData, key: string) => text(formData, key) || null;

// ---------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Ingresá tu email y tu contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email o contraseña incorrectos." };

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

/** Alta rápida desde la lista: nombre + grupo. El resto se edita después. */
export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const name = text(formData, "name");
  const menu_group = text(formData, "menu_group") as MenuGroup;
  if (!name) return { error: "Escribí un nombre para la categoría." };
  if (!MENU_GROUPS.some((g) => g.id === menu_group)) return { error: "Elegí un grupo." };

  const { error } = await supabase
    .from("categories")
    .insert({ name, menu_group, sort_order: (await maxSortOrder(supabase, "categories")) + 1 });

  if (error) return { error: `No se pudo crear la categoría: ${error.message}` };
  refresh();
  return { ok: true };
}

/** Edición completa: nombre, grupo, formato, columnas de precio, nota y foto. */
export async function updateCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const menu_group = text(formData, "menu_group") as MenuGroup;
  const kind = text(formData, "kind") as CategoryKind;
  // "Entera, Media" → ["Entera", "Media"]
  const price_columns = text(formData, "price_columns")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const note = optionalText(formData, "note");
  const image_url = optionalText(formData, "image_url");

  if (!name) return { error: "El nombre no puede quedar vacío." };
  if (!MENU_GROUPS.some((g) => g.id === menu_group)) return { error: "Elegí un grupo." };
  if (!CATEGORY_KINDS.some((k) => k.id === kind)) return { error: "Elegí un formato." };
  if (price_columns.length > 6) return { error: "Usá como máximo 6 columnas de precio." };

  const { data: before } = await supabase.from("categories").select("image_url").eq("id", id).maybeSingle();

  const { error } = await supabase
    .from("categories")
    .update({ name, menu_group, kind, price_columns, note, image_url })
    .eq("id", id);
  if (error) return { error: `No se pudo guardar: ${error.message}` };

  if (before?.image_url && before.image_url !== image_url) await removeImage(supabase, before.image_url);
  redirect("/admin/categories");
}

/**
 * Sube o baja una categoría un lugar DENTRO de su grupo.
 * Primero re-numera todo 1..n (por si hay empates) y después intercambia
 * el orden con la vecina del mismo grupo.
 */
export async function moveCategory(id: string, direction: "up" | "down") {
  const { supabase } = await requireUser();
  const { data: cats } = await supabase
    .from("categories")
    .select("id, sort_order, menu_group")
    .order("sort_order")
    .order("name");
  if (!cats) return;

  const order = new Map(cats.map((c, index) => [c.id, index + 1]));
  const current = cats.find((c) => c.id === id);
  if (!current) return;

  const sameGroup = cats.filter((c) => c.menu_group === current.menu_group);
  const i = sameGroup.findIndex((c) => c.id === id);
  const neighbor = sameGroup[direction === "up" ? i - 1 : i + 1];
  if (!neighbor) return;

  const a = order.get(current.id)!;
  order.set(current.id, order.get(neighbor.id)!);
  order.set(neighbor.id, a);

  await Promise.all(
    cats.map((c) =>
      c.sort_order === order.get(c.id)
        ? null
        : supabase.from("categories").update({ sort_order: order.get(c.id)! }).eq("id", c.id),
    ),
  );
  refresh();
}

export async function deleteCategory(id: string): Promise<ActionState> {
  const { supabase } = await requireUser();
  const { data: cat } = await supabase.from("categories").select("image_url").eq("id", id).maybeSingle();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    // 23503 = foreign key: todavía tiene productos
    if (error.code === "23503") return { error: "Esta categoría tiene productos. Movelos o borralos primero." };
    return { error: `No se pudo borrar: ${error.message}` };
  }
  if (cat?.image_url) await removeImage(supabase, cat.image_url);
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------

/**
 * Lee el formulario de producto. Los precios llegan como dos listas
 * paralelas: price_label[] y price_value[] (una fila por tamaño/combo).
 */
function parseProduct(formData: FormData) {
  const title = text(formData, "title");
  const category_id = text(formData, "category_id");
  const labels = formData.getAll("price_label").map((v) => String(v).trim());
  const values = formData.getAll("price_value").map((v) => String(v).trim());

  if (!title) return { error: "Escribí el nombre del producto." } as const;
  if (!category_id) return { error: "Elegí una categoría." } as const;

  const prices: PriceItem[] = [];
  for (let i = 0; i < values.length; i++) {
    const price = parsePrice(values[i] ?? "");
    if (price === null) continue; // fila vacía: se ignora
    if (Number.isNaN(price) || price < 0) {
      return { error: `El precio "${values[i]}" no es válido. Usá números, por ejemplo 12800 o 1250,50.` } as const;
    }
    prices.push({ label: labels[i] ?? "", price });
  }

  return {
    data: {
      title,
      category_id,
      prices,
      description: optionalText(formData, "description"),
      note: optionalText(formData, "note"),
      image_url: optionalText(formData, "image_url"),
      is_available: formData.get("is_available") === "on",
      needs_review: formData.get("needs_review") === "on",
    },
  } as const;
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const parsed = parseProduct(formData);
  if ("error" in parsed) return { error: parsed.error };

  // Va al final de su categoría
  const { data: last } = await supabase
    .from("products")
    .select("sort_order")
    .eq("category_id", parsed.data.category_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("products")
    .insert({ ...parsed.data, sort_order: (last?.sort_order ?? 0) + 1 });
  if (error) return { error: `No se pudo guardar: ${error.message}` };

  redirect("/admin");
}

export async function updateProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const id = text(formData, "id");
  const parsed = parseProduct(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data: before } = await supabase.from("products").select("image_url").eq("id", id).maybeSingle();

  const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
  if (error) return { error: `No se pudo guardar: ${error.message}` };

  if (before?.image_url && before.image_url !== parsed.data.image_url) {
    await removeImage(supabase, before.image_url);
  }
  redirect("/admin");
}

export async function deleteProduct(id: string): Promise<ActionState> {
  const { supabase } = await requireUser();
  const { data: product } = await supabase.from("products").select("image_url").eq("id", id).maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: `No se pudo borrar: ${error.message}` };

  if (product?.image_url) await removeImage(supabase, product.image_url);
  refresh();
  return { ok: true };
}

/** Toggle Disponible / Agotado. */
export async function setAvailability(id: string, isAvailable: boolean): Promise<ActionState> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("products").update({ is_available: isAvailable }).eq("id", id);
  if (error) return { error: `No se pudo actualizar: ${error.message}` };
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------
// Aumento masivo de precios
// ---------------------------------------------------------------------

export async function increasePrices(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const categoryId = text(formData, "category_id") || null; // "" = todas
  const percent = parsePrice(text(formData, "percent"));
  const roundTo = Number(text(formData, "round_to") || 100);

  if (percent === null || Number.isNaN(percent) || percent === 0) {
    return { error: "Ingresá un porcentaje, por ejemplo 10 o 7,5." };
  }
  if (percent > 500) return { error: "El porcentaje es demasiado alto." };

  const { data, error } = await supabase.rpc("increase_prices", {
    p_category_id: categoryId,
    p_percent: percent,
    p_round_to: roundTo,
  });
  if (error) return { error: `No se pudieron actualizar los precios: ${error.message}` };

  refresh();
  const n = data ?? 0;
  return { ok: true, message: `Listo: se actualizaron ${n} ${n === 1 ? "producto" : "productos"}.` };
}

// ---------------------------------------------------------------------
// Utilidades internas
// ---------------------------------------------------------------------

async function maxSortOrder(supabase: Supabase, table: "categories" | "products") {
  const { data } = await supabase
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.sort_order ?? 0;
}

/**
 * Borra una foto de Storage a partir de su URL pública.
 * Best-effort: si falla no interrumpe la acción principal.
 */
async function removeImage(supabase: Supabase, publicUrl: string) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return; // no es una foto de nuestro bucket
  const path = decodeURIComponent(publicUrl.slice(index + marker.length));
  await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
}
