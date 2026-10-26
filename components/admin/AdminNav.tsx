"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, Tags, QrCode } from "lucide-react";

const links = [
  { href: "/admin", label: "Productos", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categorías", icon: Tags },
  { href: "/admin/qr", label: "QR", icon: QrCode },
];

/** Navegación del panel; resalta la sección actual. */
export function AdminNav() {
  const pathname = usePathname();
  return <AdminNavLinks pathname={pathname} />;
}

/**
 * Los links en sí. Sin pathname (pathname = "") se usan como fallback
 * del <Suspense> en el layout mientras se resuelve la URL.
 */
export function AdminNavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex items-center gap-1" aria-label="Secciones del panel">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin"
            ? pathname === "/admin" || pathname.startsWith("/admin/products")
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
              active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
