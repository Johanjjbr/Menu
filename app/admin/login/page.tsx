import { restaurant } from "@/lib/config";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Ingresar" };

/**
 * Login del panel. Si ya hay sesión, el proxy redirige a /admin antes
 * de llegar acá. No hay registro público: el usuario se crea a mano en
 * Supabase → Authentication → Users.
 */
export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-extrabold">{restaurant.name}</h1>
        <p className="mt-1 text-ink-soft">Ingresá para editar la carta.</p>
        <LoginForm />
      </div>
    </main>
  );
}
