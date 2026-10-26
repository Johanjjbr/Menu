"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { Plus, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import { createCategory, moveCategory, deleteCategory } from "@/app/admin/actions";
import { CATEGORY_KINDS, MENU_GROUPS, type CategoryKind } from "@/lib/types";
import { DeleteButton } from "./DeleteButton";
import { inputClass, buttonPrimary, iconButton, FormError } from "./ui";

/** Alta rápida: nombre + grupo (el formato y las columnas se editan después). */
export function CategoryCreateForm() {
  const [state, action, pending] = useActionState(createCategory, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <label htmlFor="new-category" className="block text-sm font-semibold">
        Nueva categoría
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="new-category"
          name="name"
          placeholder="Ej: Pastas"
          required
          maxLength={80}
          className={`${inputClass} min-w-0 flex-1 basis-48`}
        />
        <select name="menu_group" aria-label="Grupo" defaultValue="comidas" className={`${inputClass} w-auto`}>
          {MENU_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className={`${buttonPrimary} shrink-0`}>
          <Plus className="size-4" aria-hidden /> Agregar
        </button>
      </div>
      <FormError message={state?.error} />
    </form>
  );
}

/** Fila de la lista: subir/bajar dentro del grupo, editar y borrar. */
export function CategoryRow({
  id,
  name,
  kind,
  priceColumns,
  productCount,
  isFirst,
  isLast,
}: {
  id: string;
  name: string;
  kind: CategoryKind;
  priceColumns: string[];
  productCount: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [moving, startMove] = useTransition();
  const move = (dir: "up" | "down") => startMove(() => moveCategory(id, dir));
  const kindLabel = CATEGORY_KINDS.find((k) => k.id === kind)?.label;

  return (
    <li className="flex items-center gap-1 px-2 py-2 sm:px-3">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => move("up")}
          disabled={isFirst || moving}
          className={`${iconButton} h-7`}
          aria-label={`Subir ${name}`}
        >
          <ChevronUp className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => move("down")}
          disabled={isLast || moving}
          className={`${iconButton} h-7`}
          aria-label={`Bajar ${name}`}
        >
          <ChevronDown className="size-4" aria-hidden />
        </button>
      </div>

      <div className="min-w-0 flex-1 px-2">
        <p className="truncate font-semibold">{name}</p>
        <p className="truncate text-sm text-ink-soft">
          {productCount === 1 ? "1 producto" : `${productCount} productos`}
          {kind !== "list" && `, ${kindLabel?.toLowerCase()}`}
          {priceColumns.length > 0 && `, columnas: ${priceColumns.join(" / ")}`}
        </p>
      </div>

      <Link href={`/admin/categories/${id}`} className={iconButton} aria-label={`Editar ${name}`}>
        <Pencil className="size-4" aria-hidden />
      </Link>
      <DeleteButton
        action={deleteCategory.bind(null, id)}
        label={`Borrar ${name}`}
        confirmText={`¿Borrar la categoría "${name}"?`}
      />
    </li>
  );
}
