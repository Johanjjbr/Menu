/**
 * Tipos de la base de datos.
 *
 * Están escritos a mano según supabase/migrations/…_init.sql. Cuando
 * cambien el esquema pueden regenerarlos automáticamente con:
 *   npx supabase gen types typescript --project-id <ID> > lib/types.ts
 * (y volver a agregar los alias de abajo).
 */
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          title: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_available?: boolean;
          created_at?: string;
        };
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
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// Alias cómodos para usar en los componentes
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type CategoryWithProducts = Category & { products: Product[] };

/** Respuesta estándar de los formularios con Server Actions. */
export type ActionState = { error?: string; ok?: boolean } | undefined;
