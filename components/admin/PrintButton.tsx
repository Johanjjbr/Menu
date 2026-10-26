"use client";

import { Printer } from "lucide-react";
import { buttonSecondary } from "./ui";

/** Abre el diálogo de impresión del navegador. */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonSecondary}>
      <Printer className="size-4" aria-hidden /> Imprimir
    </button>
  );
}
