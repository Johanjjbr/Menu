"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Plus, ChevronUp, ChevronDown, Pencil, Check, X } from "lucide-react";
import {
  createCategory,
  renameCategory,
  moveCategory,
  deleteCategory,
} from "@/app/admin/actions";
import type { ActionState } from "@/lib/types";
import { DeleteButton } from "./DeleteButton";
import { inputClass, buttonPrimary, iconButton, FormError } from "./ui";

/** Formulario para agregar una categoría nueva (queda al final del orden). */
export function CategoryCreateForm() {
  const [state, action, pending] = useActionState(createCategory, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Limpia el campo cuando se creó bien
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <label htmlFor="new-category" className="block text-sm font-semibold">
        Nueva categoría
      </label>
      <div className="flex gap-2">
        <input
          id="new-category"
          name="name"
          placeholder="Ej: Pastas"
          required
          maxLength={80}
          className={inputClass}
        />
        <button type="submit" disabled={pending} className={`${buttonPrimary} shrink-0`}>
          <Plus className="size-4" aria-hidden /> Agregar
        </button>
      </div>
      <FormError message={state?.error} />
    </form>
  );
}

/** Una fila de la lista: subir/bajar, renombrar en el lugar y borrar. */
export function CategoryRow({
  id,
  name,
  productCount,
  isFirst,
  isLast,
}: {
  id: string;
  name: string;
  productCount: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  // Envolvemos la acción para salir del modo edición cuando se guardó bien
  const [state, action, saving] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await renameCategory(prev, formData);
      if (result?.ok) setEditing(false);
      return result;
    },
    undefined,
  );
  const [moving, startMove] = useTransition();

  const move = (dir: "up" | "down") => startMove(() => moveCategory(id, dir));

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

      {editing ? (
        <form action={action} className="flex flex-1 items-center gap-1">
          <input type="hidden" name="id" value={id} />
          <input
            name="name"
            defaultValue={name}
            required
            maxLength={80}
            autoFocus
            aria-label="Nombre de la categoría"
            className={`${inputClass} py-1.5`}
          />
          <button type="submit" disabled={saving} className={iconButton} aria-label="Guardar nombre">
            <Check className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className={iconButton}
            aria-label="Cancelar"
          >
            <X className="size-4" aria-hidden />
          </button>
          <FormError message={state?.error} />
        </form>
      ) : (
        <>
          <div className="min-w-0 flex-1 px-2">
            <p className="truncate font-semibold">{name}</p>
            <p className="text-sm text-ink-soft">
              {productCount === 1 ? "1 producto" : `${productCount} productos`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={iconButton}
            aria-label={`Renombrar ${name}`}
          >
            <Pencil className="size-4" aria-hidden />
          </button>
          <DeleteButton
            action={deleteCategory.bind(null, id)}
            label={`Borrar ${name}`}
            confirmText={`¿Borrar la categoría "${name}"?`}
          />
        </>
      )}
    </li>
  );
}
