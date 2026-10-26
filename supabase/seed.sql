-- =====================================================================
--  Carta de La Carmela Café-Bar, transcripta de las fotos de la carta.
--  Ejecutar DESPUÉS de la migración inicial (una sola vez).
--
--  needs_review = true marca precios dudosos o ilegibles en la foto, o
--  productos sin precio. En /admin aparecen con la etiqueta "Revisar".
-- =====================================================================

begin;

-- Panadería
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Panadería', 'cafeteria', 'list', '{}', null, 1) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Tortita', null, null, '[{"label": "", "price": 700}]'::jsonb, false, 1),
  ('Tostadas de manteca y dulce', null, null, '[{"label": "Cada una", "price": 3000}, {"label": "", "price": 7700}]'::jsonb, true, 2),
  ('Semita', null, null, '[{"label": "", "price": 700}]'::jsonb, false, 3),
  ('Medialuna', null, null, '[{"label": "", "price": 1000}]'::jsonb, false, 4),
  ('Medialuna croissant', 'Con jamón y queso.', null, '[{"label": "", "price": 3500}]'::jsonb, false, 5),
  ('Semita con huevo revuelto', null, null, '[{"label": "", "price": 3500}]'::jsonb, false, 6)
) as v(title, description, note, prices, needs_review, sort_order);

-- Cafetería
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Cafetería', 'cafeteria', 'list', '{}', null, 2) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Café', null, null, '[{"label": "Grande", "price": 3600}, {"label": "Jarrito", "price": 3300}, {"label": "Chico", "price": 3000}]'::jsonb, false, 1),
  ('Café con leche', null, null, '[{"label": "+ 2 semitas de jamón y queso", "price": 5000}]'::jsonb, true, 2),
  ('Leche', null, null, '[{"label": "+ 2 tostadas de manteca", "price": 5000}]'::jsonb, true, 3),
  ('Cappuccino', null, null, '[{"label": "", "price": 4500}]'::jsonb, false, 4),
  ('Submarino', null, null, '[{"label": "", "price": 4500}]'::jsonb, false, 5),
  ('Té clásico', null, null, '[{"label": "Solo", "price": 2500}, {"label": "+ 1 semita de jamón y queso", "price": 3200}]'::jsonb, false, 6),
  ('Té con leche', null, null, '[{"label": "Solo", "price": 3500}, {"label": "+ 1 medialuna", "price": 4500}]'::jsonb, false, 7),
  ('Té de hierbas', null, null, '[{"label": "Solo", "price": 2800}, {"label": "+ galletitas", "price": 3500}]'::jsonb, false, 8)
) as v(title, description, note, prices, needs_review, sort_order);

-- Tostados
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Tostados', 'cafeteria', 'list', '{}', null, 3) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Tostado clásico', 'Pan de miga, jamón cocido y queso.', null, '[{"label": "Entero", "price": 9000}, {"label": "Medio", "price": 5000}]'::jsonb, true, 1),
  ('Tostado americano', 'Pan de miga, jamón cocido, queso, tomate y lechuga.', null, '[{"label": "", "price": 9500}]'::jsonb, false, 2),
  ('Tostado americano La Carmela', 'Pan de miga y jamón crudo.', null, '[]'::jsonb, true, 3),
  ('Clásico triple', 'Pan de miga, jamón cocido, queso, morrón y huevo duro.', null, '[{"label": "", "price": 10000}]'::jsonb, false, 4)
) as v(title, description, note, prices, needs_review, sort_order);

-- Jugos y licuados
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Jugos y licuados', 'cafeteria', 'list', '{}', null, 4) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Jugo de naranja', null, null, '[{"label": "", "price": 3000}]'::jsonb, true, 1),
  ('Jugo natural exprimido', null, null, '[{"label": "", "price": 3500}]'::jsonb, true, 2),
  ('Limonada', null, null, '[{"label": "", "price": 3000}]'::jsonb, false, 3),
  ('Licuado', 'Varios sabores.', null, '[{"label": "Con leche", "price": 4500}, {"label": "Con agua", "price": 3900}]'::jsonb, false, 4)
) as v(title, description, note, prices, needs_review, sort_order);

-- Promos
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Promos', 'cafeteria', 'promo', '{}', null, 5) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Cortado + 2 medialunas + jugo', null, null, '[{"label": "", "price": 5600}]'::jsonb, false, 1),
  ('Tostado + jugo natural', null, null, '[{"label": "", "price": 12000}]'::jsonb, false, 2),
  ('Submarino + 2 medialunas', null, null, '[{"label": "", "price": 6500}]'::jsonb, false, 3)
) as v(title, description, note, prices, needs_review, sort_order);

-- Menú del día
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Menú del día', 'comidas', 'daily', '{}', 'Consultá la opción de hoy.', 6) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Suprema con fritas o ensalada', null, null, '[{"label": "", "price": 14000}]'::jsonb, false, 1),
  ('Tarta de verduras', null, 'Grande', '[{"label": "", "price": 16000}]'::jsonb, false, 2),
  ('Ravioles con salsa o queso', null, null, '[{"label": "", "price": 18000}]'::jsonb, false, 3),
  ('Tallarines con salsa o queso', null, null, '[{"label": "", "price": 18000}]'::jsonb, false, 4)
) as v(title, description, note, prices, needs_review, sort_order);

-- Platos y sándwiches
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Platos y sándwiches', 'comidas', 'list', '{}', null, 7) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Barroluco', null, null, '[{"label": "", "price": 28000}]'::jsonb, false, 1),
  ('Milanesa al plato con fritas', null, null, '[{"label": "", "price": 15000}]'::jsonb, false, 2),
  ('Milanesa a caballo', null, 'Con fritas', '[{"label": "", "price": 17000}]'::jsonb, false, 3),
  ('Milanesa napolitana', null, 'Con fritas', '[{"label": "", "price": 19000}]'::jsonb, false, 4),
  ('Lomipizza La Carmela', null, null, '[{"label": "", "price": 42000}]'::jsonb, false, 5),
  ('Pachata completa', null, 'Con fritas', '[{"label": "", "price": 16000}]'::jsonb, false, 6),
  ('Hamburguesa completa', null, null, '[{"label": "", "price": 10000}]'::jsonb, false, 7),
  ('Lomo completo', null, 'Súper grande, con fritas', '[{"label": "", "price": 21000}]'::jsonb, false, 8),
  ('Lomo al plato', null, 'Con fritas', '[{"label": "", "price": 23000}]'::jsonb, false, 9),
  ('Sándwich de milanesa', null, 'Grande', '[{"label": "", "price": 9000}]'::jsonb, false, 10),
  ('Choripán', null, null, '[]'::jsonb, true, 11)
) as v(title, description, note, prices, needs_review, sort_order);

-- Pizzas
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Pizzas', 'comidas', 'list', '{"Entera","Media"}', null, 8) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Pizza especial', null, null, '[{"label": "Entera", "price": 15000}, {"label": "Media", "price": 8000}]'::jsonb, false, 1),
  ('Pizza muzzarella', null, null, '[{"label": "Entera", "price": 14000}, {"label": "Media", "price": 7500}]'::jsonb, false, 2),
  ('Pizza napolitana', null, null, '[{"label": "Entera", "price": 16000}, {"label": "Media", "price": 9000}]'::jsonb, false, 3)
) as v(title, description, note, prices, needs_review, sort_order);

-- Empanadas
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Empanadas', 'comidas', 'list', '{"Docena","Media docena"}', null, 9) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Empanadas criollas', null, null, '[{"label": "Docena", "price": 15000}, {"label": "Media docena", "price": 8000}]'::jsonb, false, 1),
  ('Empanadas árabes', null, null, '[{"label": "Docena", "price": 18000}, {"label": "Media docena", "price": 9000}]'::jsonb, false, 2),
  ('Empanadas de jamón y queso', null, null, '[{"label": "Docena", "price": 16000}, {"label": "Media docena", "price": 8500}]'::jsonb, false, 3)
) as v(title, description, note, prices, needs_review, sort_order);

-- Papas fritas
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Papas fritas', 'comidas', 'list', '{}', null, 10) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Papas fritas', null, 'Porción grande', '[{"label": "", "price": 7000}]'::jsonb, false, 1),
  ('Papas fritas con cheddar y panceta ahumada', null, null, '[{"label": "", "price": 12000}]'::jsonb, false, 2),
  ('Papas fritas con huevo revuelto', null, null, '[{"label": "", "price": 10000}]'::jsonb, false, 3)
) as v(title, description, note, prices, needs_review, sort_order);

-- Gaseosas y aguas
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Gaseosas y aguas', 'bebidas', 'list', '{"Lata","500 ml","Vidrio","1½ L","2¼ L"}', null, 11) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Coca-Cola', null, null, '[{"label": "Lata", "price": 1900}, {"label": "500 ml", "price": 2500}, {"label": "Vidrio", "price": 5000}, {"label": "1½ L", "price": 5900}]'::jsonb, false, 1),
  ('Sprite', null, null, '[{"label": "Lata", "price": 1900}, {"label": "500 ml", "price": 2600}, {"label": "Vidrio", "price": 5000}, {"label": "1½ L", "price": 5900}]'::jsonb, false, 2),
  ('Fanta', null, null, '[{"label": "Lata", "price": 1900}, {"label": "500 ml", "price": 2500}, {"label": "Vidrio", "price": 5000}, {"label": "1½ L", "price": 5900}, {"label": "2¼ L", "price": 6200}]'::jsonb, false, 3),
  ('Pepsi', null, null, '[{"label": "Lata", "price": 1800}, {"label": "500 ml", "price": 2500}, {"label": "1½ L", "price": 5500}, {"label": "2¼ L", "price": 5800}]'::jsonb, false, 4),
  ('Mirinda', null, null, '[]'::jsonb, true, 5),
  ('Seven Up', null, null, '[{"label": "Lata", "price": 1800}, {"label": "500 ml", "price": 2500}, {"label": "1½ L", "price": 5500}, {"label": "2¼ L", "price": 5800}]'::jsonb, false, 6),
  ('Paso de los Toros', null, null, '[{"label": "Lata", "price": 1800}, {"label": "500 ml", "price": 2000}, {"label": "1½ L", "price": 6500}]'::jsonb, false, 7),
  ('Schweppes', null, null, '[{"label": "Lata", "price": 1900}, {"label": "500 ml", "price": 2500}, {"label": "1½ L", "price": 5500}]'::jsonb, false, 8),
  ('Agua con gas', null, null, '[{"label": "500 ml", "price": 2900}]'::jsonb, false, 9),
  ('Agua sin gas', null, null, '[{"label": "500 ml", "price": 2300}, {"label": "1½ L", "price": 2800}]'::jsonb, false, 10),
  ('Aquarius', null, null, '[{"label": "500 ml", "price": 2500}, {"label": "1½ L", "price": 5000}]'::jsonb, false, 11),
  ('Gatorade', null, null, '[{"label": "400 ml", "price": 1900}, {"label": "500 ml", "price": 3500}, {"label": "1½ L", "price": 6900}]'::jsonb, true, 12),
  ('Pritty limón', null, null, '[{"label": "500 ml", "price": 2000}, {"label": "1 L", "price": 2500}, {"label": "1½ L", "price": 3500}, {"label": "2¼ L", "price": 4500}]'::jsonb, true, 13),
  ('Crush naranja', null, null, '[]'::jsonb, true, 14)
) as v(title, description, note, prices, needs_review, sort_order);

-- Energizantes y jugos
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Energizantes y jugos', 'bebidas', 'list', '{}', null, 12) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Speed', null, null, '[{"label": "Chico", "price": 2500}, {"label": "Grande", "price": 4200}]'::jsonb, false, 1),
  ('Powerade', null, null, '[{"label": "", "price": 3000}]'::jsonb, false, 2),
  ('Red Bull', null, null, '[{"label": "", "price": 3500}]'::jsonb, false, 3),
  ('Monster', null, null, '[{"label": "", "price": 3500}]'::jsonb, true, 4),
  ('Ades', null, null, '[{"label": "", "price": 3900}]'::jsonb, true, 5),
  ('Cepita', null, null, '[{"label": "Caja", "price": 1000}, {"label": "Botellita", "price": 2000}, {"label": "1 L", "price": 4800}, {"label": "1½ L", "price": 5900}]'::jsonb, true, 6)
) as v(title, description, note, prices, needs_review, sort_order);

-- Cervezas
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Cervezas', 'bebidas', 'list', '{"Litro","Lata 473","Lata 710"}', null, 13) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Quilmes', null, null, '[{"label": "Litro", "price": 6000}, {"label": "Lata 473", "price": 4000}, {"label": "Lata 710", "price": 4500}]'::jsonb, true, 1),
  ('Andes', null, null, '[{"label": "Litro", "price": 5500}, {"label": "Lata 473", "price": 4000}, {"label": "Lata 710", "price": 4500}]'::jsonb, true, 2),
  ('Stella Artois', null, null, '[{"label": "Litro", "price": 9000}, {"label": "Lata 473", "price": 5000}, {"label": "Lata 710", "price": 7000}]'::jsonb, true, 3),
  ('Imperial Golden', null, null, '[{"label": "Litro", "price": 6500}, {"label": "Lata 473", "price": 4500}, {"label": "Lata 710", "price": 5500}]'::jsonb, true, 4),
  ('Schneider', null, null, '[{"label": "Litro", "price": 6000}, {"label": "Lata 473", "price": 4800}, {"label": "Lata 710", "price": 5000}]'::jsonb, true, 5),
  ('Miller', null, null, '[{"label": "Litro", "price": 8500}, {"label": "Lata 710", "price": 7000}]'::jsonb, true, 6),
  ('Corona', null, null, '[{"label": "Litro", "price": 8500}]'::jsonb, true, 7),
  ('Salta', null, null, '[]'::jsonb, true, 8),
  ('Heineken', null, null, '[]'::jsonb, true, 9)
) as v(title, description, note, prices, needs_review, sort_order);

-- Vinos
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Vinos', 'bebidas', 'list', '{}', null, 14) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Callia', null, null, '[]'::jsonb, true, 1),
  ('Fuego Negro', null, null, '[{"label": "", "price": 9900}]'::jsonb, false, 2),
  ('Eugenio', null, null, '[{"label": "", "price": 9900}]'::jsonb, false, 3),
  ('Graffigna', null, null, '[]'::jsonb, true, 4),
  ('Ampakama', null, null, '[]'::jsonb, true, 5),
  ('Dadá espumante', null, null, '[]'::jsonb, true, 6),
  ('Finca Natalina', null, null, '[]'::jsonb, true, 7),
  ('Avanti', null, null, '[{"label": "", "price": 9000}]'::jsonb, true, 8),
  ('Colón', null, 'Dulce', '[{"label": "", "price": 9900}]'::jsonb, false, 9),
  ('Colón blanco', null, null, '[{"label": "", "price": 9900}]'::jsonb, false, 10)
) as v(title, description, note, prices, needs_review, sort_order);

-- Tragos
with c as (insert into public.categories (name, menu_group, kind, price_columns, note, sort_order) values ('Tragos', 'bebidas', 'list', '{}', null, 15) returning id)
insert into public.products (category_id, title, description, note, prices, needs_review, sort_order)
select c.id, v.* from c, (values
  ('Fernet', null, 'Copón', '[{"label": "", "price": 6000}]'::jsonb, false, 1),
  ('Campari', null, null, '[{"label": "", "price": 6000}]'::jsonb, false, 2),
  ('Sernova', null, null, '[]'::jsonb, true, 3),
  ('Whisky premium', null, null, '[{"label": "", "price": 5500}]'::jsonb, false, 4),
  ('Coñac', null, null, '[{"label": "", "price": 3500}]'::jsonb, false, 5),
  ('Gancia', null, 'Copón', '[{"label": "", "price": 6000}]'::jsonb, false, 6),
  ('Cinzano', null, 'Copón', '[{"label": "", "price": 6000}]'::jsonb, false, 7)
) as v(title, description, note, prices, needs_review, sort_order);

commit;

-- 15 categorías · 95 productos · 31 para revisar
