# Menú digital · La Carmela Café‑Bar

Carta digital de La Carmela: los clientes escanean un QR y ven la carta actualizada; el dueño la edita desde un panel protegido.

- **`/menu`**: vista pública, mobile-first
- **`/admin`**: panel con login (productos, precios por tamaño, categorías, fotos, disponibilidad, aumento masivo de precios, QR)

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

1. **SQL Editor → New query**: pegar y ejecutar `supabase/setup-completo.sql`
   (crea el esquema y carga la carta transcripta de las fotos; son los mismos
   `migrations/20261026000000_init.sql` + `seed.sql` en un solo archivo)
2. **Authentication → Sign In / Providers**: desactivar *Allow new users to sign up*.
   Las políticas permiten escribir a cualquier usuario autenticado, así que el registro tiene que estar cerrado.
3. **Authentication → Users → Add user → Create new user**: crear el usuario del dueño (marcar *Auto Confirm User*)
4. **Project Settings → API Keys**: copiar la URL y la *publishable key* a `.env.local`

## Deploy en Vercel

1. Importar el repo desde GitHub (*Add New → Project*)
2. En *Environment Variables* cargar las mismas variables de `.env.example`
3. Deploy. Cada push a `main` despliega automáticamente.

## Cómo se modela la carta

- **Grupos**: cada categoría pertenece a `cafeteria`, `comidas` o `bebidas` (las 3 pestañas de /menu).
- **Formato** (`kind`): `list` (lista), `daily` (tarjeta "Menú del día") o `promo` (tarjetas de combos).
- **Columnas de precio** (`price_columns`): si una categoría las tiene (ej. `Entera, Media`), se muestra como tabla.
- **Precios** (`products.prices`, JSON): lista de `{ label, price }`. Sirve para un precio único (`label` vacío),
  tamaños (`Grande`, `Lata`) o combos (`+ 2 medialunas`). Sin precios → "Consultar".
- **`needs_review`**: marca interna para precios dudosos. En /admin aparece la etiqueta "Revisar".
- **Aumento masivo**: la función SQL `increase_prices(categoría | null, %, redondeo)`, usada desde /admin/categories.

## Estructura

```
app/
  menu/                 Vista pública (Server Component + Suspense)
  admin/
    login/              Login (fuera del layout del panel)
    (panel)/            Layout con navegación del admin
      page.tsx          Productos
      categories/       Categorías + aumento masivo de precios
      categories/[id]/  Edición de categoría (grupo, formato, columnas, foto)
      products/new/     Alta de producto
      products/[id]/    Edición de producto
      qr/               Generador de QR
    actions.ts          Server Actions (todas re-verifican la sesión)
components/
  menu/                 Carta: MenuBrowser (pestañas, chips, buscador),
                        CategorySection (lista / tabla / menú del día / promos)
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
  seed.sql              Carta de La Carmela (95 productos)
  setup-completo.sql    Migración + carta en un solo archivo
```

## Seguridad

- La *publishable/anon key* es pública por diseño: lo que protege los datos son las políticas **RLS**.
- La *service_role / secret key* **nunca** se usa en este proyecto ni se sube al repo.
- `proxy.ts` es solo un filtro rápido; cada Server Action vuelve a verificar al usuario con `requireUser()`.
