"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { signIn } from "@/app/admin/actions";
import { Field, inputClass, buttonPrimary, FormError } from "@/components/admin/ui";

export function LoginForm() {
  // useActionState: ejecuta la Server Action y nos da el error y el "pending"
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="mt-8 space-y-4">
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Contraseña" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>

      <FormError message={state?.error} />

      <button type="submit" disabled={pending} className={`${buttonPrimary} w-full`}>
        <LogIn className="size-4" aria-hidden />
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
