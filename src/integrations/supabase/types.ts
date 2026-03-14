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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      credits: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
          serie_id: string | null
          video_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role: string
          serie_id?: string | null
          video_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
          serie_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credits_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      films: {
        Row: {
          banner_url: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          creator_id: string
          credits: Json | null
          duration_minutes: number | null
          featured: boolean | null
          genre: string[] | null
          id: string
          poster_url: string | null
          release_year: number | null
          slug: string | null
          status: Database["public"]["Enums"]["submission_status"]
          synopsis: string | null
          tagline: string | null
          tags: string[] | null
          title: string
          trailer_url: string | null
          updated_at: string
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          banner_url?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          creator_id: string
          credits?: Json | null
          duration_minutes?: number | null
          featured?: boolean | null
          genre?: string[] | null
          id?: string
          poster_url?: string | null
          release_year?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          synopsis?: string | null
          tagline?: string | null
          tags?: string[] | null
          title: string
          trailer_url?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          banner_url?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          creator_id?: string
          credits?: Json | null
          duration_minutes?: number | null
          featured?: boolean | null
          genre?: string[] | null
          id?: string
          poster_url?: string | null
          release_year?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          synopsis?: string | null
          tagline?: string | null
          tags?: string[] | null
          title?: string
          trailer_url?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      genres: {
        Row: {
          created_at: string
          id: string
          name: string
          priority: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          priority?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          priority?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          genre_focus: string[] | null
          id: string
          location: string | null
          slug: string | null
          social_links: Json | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          genre_focus?: string[] | null
          id?: string
          location?: string | null
          slug?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          genre_focus?: string[] | null
          id?: string
          location?: string | null
          slug?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      shorts: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          duration_seconds: number | null
          featured: boolean | null
          genre: string[] | null
          id: string
          status: Database["public"]["Enums"]["submission_status"]
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          duration_seconds?: number | null
          featured?: boolean | null
          genre?: string[] | null
          id?: string
          status?: Database["public"]["Enums"]["submission_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          duration_seconds?: number | null
          featured?: boolean | null
          genre?: string[] | null
          id?: string
          status?: Database["public"]["Enums"]["submission_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      sub_genres: {
        Row: {
          created_at: string
          genre_id: string
          id: string
          name: string
          priority: number
        }
        Insert: {
          created_at?: string
          genre_id: string
          id?: string
          name: string
          priority?: number
        }
        Update: {
          created_at?: string
          genre_id?: string
          id?: string
          name?: string
          priority?: number
        }
        Relationships: [
          {
            foreignKeyName: "sub_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          creator_id: string
          film_id: string | null
          id: string
          reviewed_at: string | null
          rights_agreed: boolean | null
          short_id: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          creator_id: string
          film_id?: string | null
          id?: string
          reviewed_at?: string | null
          rights_agreed?: boolean | null
          short_id?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          creator_id?: string
          film_id?: string | null
          id?: string
          reviewed_at?: string | null
          rights_agreed?: boolean | null
          short_id?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_short_id_fkey"
            columns: ["short_id"]
            isOneToOne: false
            referencedRelation: "shorts"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          quote: string
          rating: number
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          quote: string
          rating?: number
          role: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          quote?: string
          rating?: number
          role?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verticals: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          duration_seconds: number | null
          featured: boolean | null
          genre: string[] | null
          id: string
          like_count: number | null
          status: Database["public"]["Enums"]["submission_status"]
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          duration_seconds?: number | null
          featured?: boolean | null
          genre?: string[] | null
          id?: string
          like_count?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          duration_seconds?: number | null
          featured?: boolean | null
          genre?: string[] | null
          id?: string
          like_count?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      video_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      video_likes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          approved: boolean
          belowAge: boolean
          created_at: string
          creator_id: string
          featured: boolean | null
          id: string
          poster_url: string | null
          preview_clip_url: string | null
          reviewed: boolean
          serie_id: string | null
          synopsis: string | null
          thumb_approved: boolean
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          belowAge?: boolean
          created_at?: string
          creator_id: string
          featured?: boolean | null
          id?: string
          poster_url?: string | null
          preview_clip_url?: string | null
          reviewed?: boolean
          serie_id?: string | null
          synopsis?: string | null
          thumb_approved?: boolean
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          belowAge?: boolean
          created_at?: string
          creator_id?: string
          featured?: boolean | null
          id?: string
          poster_url?: string | null
          preview_clip_url?: string | null
          reviewed?: boolean
          serie_id?: string | null
          synopsis?: string | null
          thumb_approved?: boolean
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "creator" | "viewer"
      content_type: "feature" | "short" | "documentary" | "series_episode"
      submission_status:
        | "draft"
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
        | "live"
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
      app_role: ["admin", "creator", "viewer"],
      content_type: ["feature", "short", "documentary", "series_episode"],
      submission_status: [
        "draft",
        "pending",
        "in_review",
        "approved",
        "rejected",
        "live",
      ],
    },
  },
} as const
