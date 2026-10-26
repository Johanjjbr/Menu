/**
 * Piezas de UI compartidas del panel admin (clases y componentes chicos).
 * Mantenerlas acá evita repetir las mismas clases de Tailwind en todos lados.
 */
import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border-2 border-line bg-card px-3 py-2.5 text-base text-ink " +
  "placeholder:text-ink-soft/70 focus:border-ink focus:outline-none";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const buttonPrimary = `${buttonBase} bg-ink text-paper hover:bg-ink/90`;
export const buttonSecondary = `${buttonBase} border-2 border-line text-ink hover:border-ink`;
export const buttonDanger = `${buttonBase} text-vermouth hover:bg-vermouth/10`;
export const iconButton =
  "inline-flex size-10 items-center justify-center rounded-lg text-ink-soft " +
  "hover:bg-line/50 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-vermouth/10 px-3 py-2 text-sm font-medium text-vermouth">
      {message}
    </p>
  );
}

export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{children}</h1>
      {action}
    </div>
  );
}
