-- =====================================================================
--  MENÚ DIGITAL LA CARMELA — Migración inicial
--  Ejecutar completo en: Supabase → SQL Editor → New query → Run
--
--  Crea:
--   1. Tablas categories y products
--   2. Función increase_prices (aumento masivo por porcentaje)
--   3. Row Level Security (lectura pública, escritura solo autenticados)
--   4. Bucket de Storage "product-images" para las fotos
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------------

-- Categorías del menú (Cafetería, Pizzas, Gaseosas...).
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 80),

  -- Grupo grande al que pertenece (las 3 pestañas de /menu)
  menu_group    text not null default 'comidas'
                check (menu_group in ('cafeteria', 'comidas', 'bebidas')),

  -- Cómo se muestra la sección:
  --   list  → lista normal
  --   daily → tarjeta destacada "Menú del día"
  --   promo → tarjetas de promociones/combos
  kind          text not null default 'list'
                check (kind in ('list', 'daily', 'promo')),

  -- Columnas de precio compartidas por todos los productos de la
  -- categoría. Ej: {Entera, Media} para pizzas o {Lata, 500 ml, 1½ L}
  -- para gaseosas. Vacío = cada producto muestra sus precios sueltos.
  price_columns text[] not null default '{}',

  note          text,          -- aclaración bajo el título ("Consultá la opción de hoy")
  image_url     text,          -- foto circular de la sección (Storage)
  sort_order    int  not null default 0,  -- "order" es palabra reservada en SQL
  created_at    timestamptz not null default now()
);

-- Productos.
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null
                references public.categories(id)
                on delete restrict,       -- no deja borrar una categoría con productos
  title         text not null check (char_length(title) between 1 and 120),
  description   text,                       -- ingredientes, guarnición
  note          text,                       -- aclaración corta: "con coca", "copón"

  -- Precios del producto: lista de { "label": text, "price": number|null }
  --   Un solo precio:   [{"label": "", "price": 9000}]
  --   Por tamaño:       [{"label": "Grande", "price": 3600}, {"label": "Chico", "price": 3000}]
  --   Combo con texto:  [{"label": "+ 2 semitas de jamón y queso", "price": 5000}]
  --   Sin precio:       []  → en la carta aparece "Consultar"
  prices        jsonb not null default '[]'::jsonb
                check (jsonb_typeof(prices) = 'array'),

  image_url     text,
  is_available  boolean not null default true,   -- Disponible / Agotado
  needs_review  boolean not null default false,  -- precio a confirmar (solo lo ve el admin)
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists categories_sort_order_idx on public.categories (sort_order);


-- ---------------------------------------------------------------------
-- 2. AUMENTO MASIVO DE PRECIOS
--    increase_prices(categoría | null = todas, porcentaje, redondeo)
--    Ej: select increase_prices(null, 10, 100);  → +10 % a todo, redondeado a $100
--    SECURITY INVOKER: corre con los permisos de quien la llama, así que
--    RLS sigue aplicando (solo usuarios autenticados pueden actualizar).
-- ---------------------------------------------------------------------

create or replace function public.increase_prices(
  p_category_id uuid,
  p_percent     numeric,
  p_round_to    int default 100
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected integer;
begin
  if p_percent is null or p_percent <= -100 or p_percent > 500 then
    raise exception 'Porcentaje inválido: %', p_percent;
  end if;

  update public.products p
  set prices = (
    select coalesce(
      jsonb_agg(
        case
          when jsonb_typeof(e -> 'price') = 'number' then
            jsonb_set(
              e,
              '{price}',
              to_jsonb(
                case
                  when p_round_to > 0 then
                    round((e ->> 'price')::numeric * (1 + p_percent / 100) / p_round_to) * p_round_to
                  else
                    round((e ->> 'price')::numeric * (1 + p_percent / 100), 2)
                end
              )
            )
          else e
        end
        order by ord
      ),
      '[]'::jsonb
    )
    from jsonb_array_elements(p.prices) with ordinality as t(e, ord)
  )
  where (p_category_id is null or p.category_id = p_category_id)
    and jsonb_array_length(p.prices) > 0;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- Solo usuarios logueados pueden ejecutarla
revoke execute on function public.increase_prices(uuid, numeric, int) from public, anon;
grant  execute on function public.increase_prices(uuid, numeric, int) to authenticated;


-- ---------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
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
-- Se leen también los agotados para mostrarlos con la etiqueta "Agotado".
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
-- 4. STORAGE: bucket público para fotos
--    Público para ver; solo autenticados suben, reemplazan o borran.
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

-- Un bucket público sirve sus archivos por /storage/v1/object/public/...
-- sin pasar por RLS, así que no hace falta política SELECT.
