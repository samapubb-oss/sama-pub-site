export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      company_info: {
        Row: {
          address: string | null
          baseline: string
          description: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          is_phone_confirmed: boolean | null
          linkedin_url: string | null
          name: string
          opening_hours: string | null
          phone: string | null
          tiktok_url: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          baseline: string
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_phone_confirmed?: boolean | null
          linkedin_url?: string | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          baseline?: string
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_phone_confirmed?: boolean | null
          linkedin_url?: string | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string | null
          display_order?: number | null
          id: string
          is_active?: boolean | null
          question: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
        }
        Relationships: []
      }
      leads_quotes: {
        Row: {
          budget_range: string
          company_name: string | null
          contact_channel: string
          contact_value: string
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          message: string | null
          service_requested: string
          status: string
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          budget_range: string
          company_name?: string | null
          contact_channel?: string
          contact_value: string
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          message?: string | null
          service_requested: string
          status?: string
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          budget_range?: string
          company_name?: string | null
          contact_channel?: string
          contact_value?: string
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          service_requested?: string
          status?: string
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      portfolio_cases: {
        Row: {
          category: string
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          metrics: Json
          objective: string
          tag: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          display_order?: number | null
          id: string
          image_url?: string | null
          is_active?: boolean | null
          metrics?: Json
          objective: string
          tag: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metrics?: Json
          objective?: string
          tag?: string
          title?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          description: string
          display_order: number | null
          features: string[] | null
          icon_name: string
          id: string
          is_active: boolean | null
          platforms: string[] | null
          tagline: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order?: number | null
          features?: string[] | null
          icon_name: string
          id: string
          is_active?: boolean | null
          platforms?: string[] | null
          tagline: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number | null
          features?: string[] | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          platforms?: string[] | null
          tagline?: string
          title?: string
        }
        Relationships: []
      }
      stats_metrics: {
        Row: {
          display_order: number | null
          icon_name: string
          id: string
          is_active: boolean | null
          label: string
          prefix: string | null
          sublabel: string | null
          suffix: string | null
          value: string
        }
        Insert: {
          display_order?: number | null
          icon_name: string
          id: string
          is_active?: boolean | null
          label: string
          prefix?: string | null
          sublabel?: string | null
          suffix?: string | null
          value: string
        }
        Update: {
          display_order?: number | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          label?: string
          prefix?: string | null
          sublabel?: string | null
          suffix?: string | null
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never
