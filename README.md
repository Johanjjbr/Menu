# Menú digital

Carta digital para restaurante: los clientes escanean un QR y ven la carta actualizada; el dueño la edita desde un panel protegido.

- **`/menu`**: vista pública, mobile-first
- **`/admin`**: panel con login (productos, categorías, fotos, disponibilidad, QR)

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage) · Vercel

El plan completo y el estado de cada fase están en [ROADMAP.md](./ROADMAP.md).

---

## Puesta en marcha local

Requisitos: Node.js 20.9 o superior.

```bash
npm install
cp .env.example .env.local      # en Windows: copy .env.example .env.local
# completar .env.local con la URL y la publishable key de Supabase
npm run dev
```

Abrir http://localhost:3000/menu y http://localhost:3000/admin

## Configurar Supabase (una sola vez)

1. **SQL Editor → New query**: pegar y ejecutar `supabase/migrations/20261026000000_init.sql`
2. (Opcional) ejecutar `supabase/seed.sql` para tener datos de ejemplo
3. **Authentication → Sign In / Providers**: desactivar *Allow new users to sign up*.
   Las políticas permiten escribir a cualquier usuario autenticado, así que el registro tiene que estar cerrado.
4. **Authentication → Users → Add user → Create new user**: crear el usuario del dueño (marcar *Auto Confirm User*)
5. **Project Settings → API Keys**: copiar la URL y la *publishable key* a `.env.local`

## Deploy en Vercel

1. Importar el repo desde GitHub (*Add New → Project*)
2. En *Environment Variables* cargar las mismas variables de `.env.example`
3. Deploy. Cada push a `main` despliega automáticamente.

## Estructura

```
app/
  menu/                 Vista pública (Server Component + Suspense)
  admin/
    login/              Login (fuera del layout del panel)
    (panel)/            Layout con navegación del admin
      page.tsx          Productos
      categories/       Categorías
      products/new/     Alta de producto
      products/[id]/    Edición de producto
      qr/               Generador de QR
    actions.ts          Server Actions (todas re-verifican la sesión)
components/
  menu/                 Componentes de la carta
  admin/                Formularios, toggle, subida de imágenes
lib/
  supabase/             Clientes: server (con cookies), client (navegador),
                        public (anónimo para /menu), proxy (sesión)
  data/menu.ts          Consulta de la carta
  auth.ts               requireUser()
  types.ts              Tipos de la base de datos
proxy.ts                Protege /admin y refresca la sesión (ex middleware)
supabase/
  migrations/           Esquema SQL + RLS + Storage
  seed.sql              Datos de ejemplo
```

## Seguridad

- La *publishable/anon key* es pública por diseño: lo que protege los datos son las políticas **RLS**.
- La *service_role / secret key* **nunca** se usa en este proyecto ni se sube al repo.
- `proxy.ts` es solo un filtro rápido; cada Server Action vuelve a verificar al usuario con `requireUser()`.
