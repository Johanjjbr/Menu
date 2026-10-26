-- =====================================================================
--  Datos de ejemplo (opcional). Se pueden borrar desde /admin.
--  Ejecutar DESPUÉS de la migración inicial.
-- =====================================================================

with cats as (
  insert into public.categories (name, sort_order) values
    ('Entradas', 1),
    ('Principales', 2),
    ('Postres', 3),
    ('Bebidas', 4)
  returning id, name
)
insert into public.products (category_id, title, description, price, is_available)
select cats.id, p.title, p.description, p.price, p.available
from cats
join (values
  ('Entradas',    'Empanadas de carne',   'Cortadas a cuchillo, al horno. Dos unidades.', 3500.00, true),
  ('Entradas',    'Provoleta',            'A la parrilla, con orégano y aceite de oliva.', 6200.00, true),
  ('Principales', 'Milanesa napolitana',  'Jamón, salsa de tomate y muzzarella, con papas fritas.', 12800.00, true),
  ('Principales', 'Bife de chorizo',      '400 g, con ensalada mixta.', 18500.00, true),
  ('Postres',     'Flan casero',          'Con dulce de leche y crema.', 4800.00, true),
  ('Bebidas',     'Limonada',             'Con menta y jengibre.', 3200.00, false),
  ('Bebidas',     'Agua sin gas',         '500 ml.', 1800.00, true)
) as p(cat, title, description, price, available) on p.cat = cats.name;
