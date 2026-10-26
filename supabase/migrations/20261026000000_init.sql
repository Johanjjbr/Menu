-- =====================================================================
--  MENÚ DIGITAL — Migración inicial
--  Ejecutar completo en: Supabase → SQL Editor → New query → Run
--
--  Crea:
--   1. Tablas categories y products
--   2. Row Level Security (lectura pública, escritura solo autenticados)
--   3. Bucket de Storage "product-images" para las fotos (Fase 4)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------------

-- Categorías del menú (Entradas, Principales, Bebidas...).
-- Nota: la columna se llama sort_order y no "order" porque ORDER es
-- palabra reservada de SQL y obligaría a usar comillas en todos lados.
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- Productos. Cada uno pertenece a una categoría.
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null
                references public.categories(id)
                on delete restrict,       -- impide borrar una categoría con productos
  title         text not null check (char_length(title) between 1 and 120),
  description   text,
  price         numeric(10,2) not null check (price >= 0),  -- numeric: exacto para dinero
  image_url     text,                       -- URL pública de Supabase Storage
  is_available  boolean not null default true,              -- Disponible / Agotado
  created_at    timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists categories_sort_order_idx on public.categories (sort_order);


-- ---------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
--    Con RLS activo todo queda bloqueado salvo lo que permitan las
--    políticas de abajo.
-- ---------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products   enable row level security;

-- ===== categories =====
create policy "categories: lectura pública"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "categories: insertar (auth)"
  on public.categories for insert
  to authenticated
  with check (true);

create policy "categories: editar (auth)"
  on public.categories for update
  to authenticated
  using (true) with check (true);

create policy "categories: borrar (auth)"
  on public.categories for delete
  to authenticated
  using (true);

-- ===== products =====
-- Se leen también los agotados para poder mostrarlos con la etiqueta
-- "Agotado" en lugar de que desaparezcan de la carta.
create policy "products: lectura pública"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "products: insertar (auth)"
  on public.products for insert
  to authenticated
  with check (true);

create policy "products: editar (auth)"
  on public.products for update
  to authenticated
  using (true) with check (true);

create policy "products: borrar (auth)"
  on public.products for delete
  to authenticated
  using (true);


-- ---------------------------------------------------------------------
-- 3. STORAGE: bucket público para fotos de productos
--    - Público: cualquiera puede VER las fotos (las usa /menu).
--    - Solo usuarios autenticados pueden subir, reemplazar o borrar.
--    - Límite 5 MB y solo imágenes.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "product-images: subir (auth)"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "product-images: reemplazar (auth)"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

create policy "product-images: borrar (auth)"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- Nota: no hace falta una política SELECT en storage.objects para ver
-- las fotos, porque un bucket público sirve sus archivos por la URL
-- /storage/v1/object/public/... sin pasar por RLS.
