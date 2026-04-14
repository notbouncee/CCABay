export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          cca_id: string
          id: string
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cca_id: string
          id?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cca_id?: string
          id?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_cca_id_fkey"
            columns: ["cca_id"]
            isOneToOne: false
            referencedRelation: "ccas"
            referencedColumns: ["id"]
          },
        ]
      }
      cca_reviews: {
        Row: {
          cca_id: string
          comment: string
          created_at: string
          id: string
          rating: number | null
          reviewer_name: string
          reviewer_role: string | null
          user_id: string
          year: string | null
        }
        Insert: {
          cca_id: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number | null
          reviewer_name?: string
          reviewer_role?: string | null
          user_id: string
          year?: string | null
        }
        Update: {
          cca_id?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number | null
          reviewer_name?: string
          reviewer_role?: string | null
          user_id?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cca_reviews_cca_id_fkey"
            columns: ["cca_id"]
            isOneToOne: false
            referencedRelation: "ccas"
            referencedColumns: ["id"]
          },
        ]
      }
      cca_wishlist: {
        Row: {
          cca_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          cca_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          cca_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cca_wishlist_cca_id_fkey"
            columns: ["cca_id"]
            isOneToOne: false
            referencedRelation: "ccas"
            referencedColumns: ["id"]
          },
        ]
      }
      ccas: {
        Row: {
          about: string | null
          audition_dates: string | null
          category: string
          contact_email: string | null
          created_at: string
          description: string
          hall_points: number | null
          id: string
          image_url: string | null
          instagram_url: string | null
          is_beginner_friendly: boolean | null
          name: string
          tags: string[] | null
          training_days: string[] | null
          training_time: string | null
          tryout_dates: string | null
          updated_at: string
          weekly_commitment: string | null
        }
        Insert: {
          about?: string | null
          audition_dates?: string | null
          category?: string
          contact_email?: string | null
          created_at?: string
          description?: string
          hall_points?: number | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_beginner_friendly?: boolean | null
          name: string
          tags?: string[] | null
          training_days?: string[] | null
          training_time?: string | null
          tryout_dates?: string | null
          updated_at?: string
          weekly_commitment?: string | null
        }
        Update: {
          about?: string | null
          audition_dates?: string | null
          category?: string
          contact_email?: string | null
          created_at?: string
          description?: string
          hall_points?: number | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_beginner_friendly?: boolean | null
          name?: string
          tags?: string[] | null
          training_days?: string[] | null
          training_time?: string | null
          tryout_dates?: string | null
          updated_at?: string
          weekly_commitment?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          faculty: string | null
          full_name: string
          id: string
          matric_number: string | null
          updated_at: string
          user_id: string
          year_of_study: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          faculty?: string | null
          full_name?: string
          id?: string
          matric_number?: string | null
          updated_at?: string
          user_id: string
          year_of_study?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          faculty?: string | null
          full_name?: string
          id?: string
          matric_number?: string | null
          updated_at?: string
          user_id?: string
          year_of_study?: number | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          commitment_level: number
          created_at: string
          goal_tags: string[]
          hall_points_target: number
          id: string
          interest_categories: string[]
          sync_timetable: boolean
          updated_at: string
          user_id: string
          wants_hall_points: boolean
        }
        Insert: {
          commitment_level?: number
          created_at?: string
          goal_tags?: string[]
          hall_points_target?: number
          id?: string
          interest_categories?: string[]
          sync_timetable?: boolean
          updated_at?: string
          user_id: string
          wants_hall_points?: boolean
        }
        Update: {
          commitment_level?: number
          created_at?: string
          goal_tags?: string[]
          hall_points_target?: number
          id?: string
          interest_categories?: string[]
          sync_timetable?: boolean
          updated_at?: string
          user_id?: string
          wants_hall_points?: boolean
        }
        Relationships: []
      }
      user_timetable: {
        Row: {
          cca_id: string | null
          created_at: string
          day_of_week: number
          end_time: string
          event_name: string
          event_type: string
          id: string
          location: string | null
          start_time: string
          user_id: string
        }
        Insert: {
          cca_id?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          event_name: string
          event_type?: string
          id?: string
          location?: string | null
          start_time: string
          user_id: string
        }
        Update: {
          cca_id?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          event_name?: string
          event_type?: string
          id?: string
          location?: string | null
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_timetable_cca_id_fkey"
            columns: ["cca_id"]
            isOneToOne: false
            referencedRelation: "ccas"
            referencedColumns: ["id"]
          },
        ]
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
