"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { ActionState } from "@/lib/types";
import { iconButton } from "./ui";

/**
 * Botón de borrar con confirmación. Recibe una Server Action ya "atada"
 * al id (action.bind(null, id)) y muestra el error si la base lo rechaza
 * (por ejemplo, una categoría que todavía tiene productos).
 */
export function DeleteButton({
  action,
  label,
  confirmText,
}: {
  action: () => Promise<ActionState>;
  label: string;
  confirmText: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function onClick() {
    if (!window.confirm(confirmText)) return;
    setError(undefined);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-label={label}
        className={`${iconButton} hover:!bg-vermouth/10 hover:!text-vermouth`}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
      {error && (
        <p
          role="alert"
          className="absolute right-0 top-11 z-10 w-56 rounded-lg bg-vermouth px-3 py-2 text-xs font-medium text-white shadow-lg"
        >
          {error}
        </p>
      )}
    </div>
  );
}
