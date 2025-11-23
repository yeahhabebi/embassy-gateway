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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_login: string | null
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          last_login?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          application_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_at: string
        }
        Insert: {
          application_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
        }
        Update: {
          application_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "visa_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_content: {
        Row: {
          content: string
          id: string
          key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: string
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_content_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_applications: {
        Row: {
          address: string
          admin_notes: string | null
          application_number: string
          city: string
          country: string
          created_at: string
          date_of_birth: string
          duration_of_stay: number | null
          email: string
          first_name: string
          gender: string
          id: string
          intended_arrival_date: string
          intended_departure_date: string | null
          last_name: string
          last_updated: string
          nationality: string
          notes: string | null
          passport_expiry_date: string
          passport_issue_country: string
          passport_issue_date: string
          passport_number: string
          phone: string
          postal_code: string | null
          purpose_of_visit: string
          status: Database["public"]["Enums"]["visa_status"]
          submission_date: string
          visa_type: Database["public"]["Enums"]["visa_type"]
        }
        Insert: {
          address: string
          admin_notes?: string | null
          application_number: string
          city: string
          country: string
          created_at?: string
          date_of_birth: string
          duration_of_stay?: number | null
          email: string
          first_name: string
          gender: string
          id?: string
          intended_arrival_date: string
          intended_departure_date?: string | null
          last_name: string
          last_updated?: string
          nationality: string
          notes?: string | null
          passport_expiry_date: string
          passport_issue_country: string
          passport_issue_date: string
          passport_number: string
          phone: string
          postal_code?: string | null
          purpose_of_visit: string
          status?: Database["public"]["Enums"]["visa_status"]
          submission_date?: string
          visa_type: Database["public"]["Enums"]["visa_type"]
        }
        Update: {
          address?: string
          admin_notes?: string | null
          application_number?: string
          city?: string
          country?: string
          created_at?: string
          date_of_birth?: string
          duration_of_stay?: number | null
          email?: string
          first_name?: string
          gender?: string
          id?: string
          intended_arrival_date?: string
          intended_departure_date?: string | null
          last_name?: string
          last_updated?: string
          nationality?: string
          notes?: string | null
          passport_expiry_date?: string
          passport_issue_country?: string
          passport_issue_date?: string
          passport_number?: string
          phone?: string
          postal_code?: string | null
          purpose_of_visit?: string
          status?: Database["public"]["Enums"]["visa_status"]
          submission_date?: string
          visa_type?: Database["public"]["Enums"]["visa_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_application_number: { Args: never; Returns: string }
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      admin_role: "super_admin" | "staff"
      visa_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "on_hold"
      visa_type:
        | "tourist"
        | "business"
        | "student"
        | "work"
        | "transit"
        | "diplomatic"
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
    Enums: {
      admin_role: ["super_admin", "staff"],
      visa_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "on_hold",
      ],
      visa_type: [
        "tourist",
        "business",
        "student",
        "work",
        "transit",
        "diplomatic",
      ],
    },
  },
} as const
