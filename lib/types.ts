/**
 * Tipos de la base de datos.
 *
 * Escritos a mano según supabase/migrations/…_init.sql. Si cambian el
 * esquema pueden regenerarlos con:
 *   npx supabase gen types typescript --project-id <ID> > lib/database.types.ts
 */

/** Grupo grande de la carta (las 3 pestañas de /menu). */
export type MenuGroup = "cafeteria" | "comidas" | "bebidas";

/** Cómo se muestra una categoría. */
export type CategoryKind = "list" | "daily" | "promo";

/** Un precio del producto. label "" = precio único. price null = sin precio. */
export type PriceItem = { label: string; price: number | null };

type CategoryRow = {
  id: string;
  name: string;
  menu_group: MenuGroup;
  kind: CategoryKind;
  price_columns: string[];
  note: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
};

type ProductRow = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  note: string | null;
  prices: PriceItem[];
  image_url: string | null;
  is_available: boolean;
  needs_review: boolean;
  sort_order: number;
  created_at: string;
};

type Insertable<T, Required extends keyof T> = Pick<T, Required> &
  Partial<Omit<T, Required>>;

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: Insertable<CategoryRow, "name">;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Insertable<ProductRow, "category_id" | "title">;
        Update: Partial<ProductRow>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      increase_prices: {
        Args: { p_category_id: string | null; p_percent: number; p_round_to: number };
        Returns: number;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Category = CategoryRow;
export type Product = ProductRow;
export type CategoryWithProducts = Category & { products: Product[] };

/** Respuesta estándar de los formularios con Server Actions. */
export type ActionState = { error?: string; ok?: boolean; message?: string } | undefined;

export const MENU_GROUPS: { id: MenuGroup; label: string }[] = [
  { id: "cafeteria", label: "Cafetería" },
  { id: "comidas", label: "Comidas" },
  { id: "bebidas", label: "Bebidas" },
];

export const CATEGORY_KINDS: { id: CategoryKind; label: string; hint: string }[] = [
  { id: "list", label: "Lista", hint: "Lista común de productos" },
  { id: "daily", label: "Menú del día", hint: "Tarjeta destacada al principio del grupo" },
  { id: "promo", label: "Promos", hint: "Tarjetas de combos y promociones" },
];
