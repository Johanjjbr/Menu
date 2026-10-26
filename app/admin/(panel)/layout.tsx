import { Suspense } from "react";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { AdminNav, AdminNavLinks } from "@/components/admin/AdminNav";

/**
 * Layout del panel (todo /admin menos /admin/login, que queda fuera del
 * grupo "(panel)"). Es estático: la sesión se verifica en el proxy y en
 * cada página/acción, no acá, para no bloquear el render del layout.
 */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-2 px-4 py-2 sm:px-6">
          <Link href="/admin" className="mr-2 font-display text-lg font-extrabold">
            Panel
          </Link>
          {/* usePathname() es dato de URL → dentro de Suspense */}
          <Suspense fallback={<AdminNavLinks pathname="" />}>
            <AdminNav />
          </Suspense>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/menu"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink sm:inline-flex"
            >
              <ExternalLink className="size-4" aria-hidden /> Ver carta
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
              >
                <LogOut className="size-4" aria-hidden />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
