export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      anytime_quiz_answers: {
        Row: {
          answer_text: string | null
          created_at: string | null
          id: string
          is_correct: boolean
          option_id: string | null
          player_id: string
          points_earned: number | null
          question_id: string
          question_index: number
          session_id: string
          submitted_at: string | null
          time_taken: number
        }
        Insert: {
          answer_text?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean
          option_id?: string | null
          player_id: string
          points_earned?: number | null
          question_id: string
          question_index: number
          session_id: string
          submitted_at?: string | null
          time_taken?: number
        }
        Update: {
          answer_text?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean
          option_id?: string | null
          player_id?: string
          points_earned?: number | null
          question_id?: string
          question_index?: number
          session_id?: string
          submitted_at?: string | null
          time_taken?: number
        }
        Relationships: [
          {
            foreignKeyName: "anytime_quiz_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anytime_quiz_answers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "anytime_quiz_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anytime_quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anytime_quiz_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "anytime_quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      anytime_quiz_players: {
        Row: {
          attempt_number: number | null
          completed_at: string | null
          correct_answers: number | null
          created_at: string | null
          email: string
          id: string
          ip_address: string
          percentage: number | null
          phone: string | null
          player_name: string
          score: number
          session_id: string
          started_at: string | null
          time_taken: number | null
          total_questions: number | null
        }
        Insert: {
          attempt_number?: number | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          email: string
          id?: string
          ip_address: string
          percentage?: number | null
          phone?: string | null
          player_name: string
          score?: number
          session_id: string
          started_at?: string | null
          time_taken?: number | null
          total_questions?: number | null
        }
        Update: {
          attempt_number?: number | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string
          percentage?: number | null
          phone?: string | null
          player_name?: string
          score?: number
          session_id?: string
          started_at?: string | null
          time_taken?: number | null
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anytime_quiz_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "anytime_quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      anytime_quiz_sessions: {
        Row: {
          collect_email: boolean | null
          collect_phone: boolean | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          game_pin: string
          host_id: string
          id: string
          max_attempts: number | null
          quiz_id: string
          require_registration: boolean | null
          show_correct_answers: boolean | null
          started_at: string | null
          status: string
          time_limit: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          collect_email?: boolean | null
          collect_phone?: boolean | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          game_pin: string
          host_id: string
          id?: string
          max_attempts?: number | null
          quiz_id: string
          require_registration?: boolean | null
          show_correct_answers?: boolean | null
          started_at?: string | null
          status?: string
          time_limit?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          collect_email?: boolean | null
          collect_phone?: boolean | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          game_pin?: string
          host_id?: string
          id?: string
          max_attempts?: number | null
          quiz_id?: string
          require_registration?: boolean | null
          show_correct_answers?: boolean | null
          started_at?: string | null
          status?: string
          time_limit?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anytime_quiz_sessions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anytime_quiz_sessions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      game_answers: {
        Row: {
          answer_text: string | null
          created_at: string | null
          id: string
          is_correct: boolean
          option_id: string | null
          player_id: string
          points_earned: number | null
          question_id: string
          question_index: number
          session_id: string
          submitted_at: string | null
          time_taken: number
        }
        Insert: {
          answer_text?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean
          option_id?: string | null
          player_id: string
          points_earned?: number | null
          question_id: string
          question_index: number
          session_id: string
          submitted_at?: string | null
          time_taken?: number
        }
        Update: {
          answer_text?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean
          option_id?: string | null
          player_id?: string
          points_earned?: number | null
          question_id?: string
          question_index?: number
          session_id?: string
          submitted_at?: string | null
          time_taken?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_answers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_players: {
        Row: {
          average_response_time: number | null
          correct_answers: number | null
          created_at: string | null
          current_streak: number | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_seen: string | null
          max_streak: number | null
          player_email: string | null
          player_name: string
          score: number
          session_id: string
          total_answers: number | null
        }
        Insert: {
          average_response_time?: number | null
          correct_answers?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_seen?: string | null
          max_streak?: number | null
          player_email?: string | null
          player_name: string
          score?: number
          session_id: string
          total_answers?: number | null
        }
        Update: {
          average_response_time?: number | null
          correct_answers?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_seen?: string | null
          max_streak?: number | null
          player_email?: string | null
          player_name?: string
          score?: number
          session_id?: string
          total_answers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          allow_late_join: boolean | null
          created_at: string | null
          current_question_index: number | null
          ended_at: string | null
          game_mode: string | null
          game_pin: string
          host_id: string
          id: string
          max_players: number | null
          quiz_id: string
          randomize_options: boolean | null
          randomize_questions: boolean | null
          show_leaderboard: boolean | null
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          allow_late_join?: boolean | null
          created_at?: string | null
          current_question_index?: number | null
          ended_at?: string | null
          game_mode?: string | null
          game_pin: string
          host_id: string
          id?: string
          max_players?: number | null
          quiz_id: string
          randomize_options?: boolean | null
          randomize_questions?: boolean | null
          show_leaderboard?: boolean | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          allow_late_join?: boolean | null
          created_at?: string | null
          current_question_index?: number | null
          ended_at?: string | null
          game_mode?: string | null
          game_pin?: string
          host_id?: string
          id?: string
          max_players?: number | null
          quiz_id?: string
          randomize_options?: boolean | null
          randomize_questions?: boolean | null
          show_leaderboard?: boolean | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean
          order_index: number | null
          question_id: string
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          order_index?: number | null
          question_id: string
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          order_index?: number | null
          question_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_answers: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          player_id: string
          question_id: string
          question_index: number
          session_id: string
          submitted_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          player_id: string
          question_id: string
          question_index: number
          session_id: string
          submitted_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          player_id?: string
          question_id?: string
          question_index?: number
          session_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_answers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "poll_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "poll_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_players: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          joined_at: string | null
          player_email: string | null
          player_name: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          joined_at?: string | null
          player_email?: string | null
          player_name: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          joined_at?: string | null
          player_email?: string | null
          player_name?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "poll_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_sessions: {
        Row: {
          allow_multiple_responses: boolean | null
          created_at: string | null
          current_question_index: number | null
          ended_at: string | null
          game_pin: string
          host_id: string
          id: string
          quiz_id: string
          show_results: boolean | null
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          allow_multiple_responses?: boolean | null
          created_at?: string | null
          current_question_index?: number | null
          ended_at?: string | null
          game_pin: string
          host_id: string
          id?: string
          quiz_id: string
          show_results?: boolean | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          allow_multiple_responses?: boolean | null
          created_at?: string | null
          current_question_index?: number | null
          ended_at?: string | null
          game_pin?: string
          host_id?: string
          id?: string
          quiz_id?: string
          show_results?: boolean | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_sessions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_sessions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          order_index: number | null
          points: number | null
          question_type: string | null
          quiz_id: string
          text: string
          time_limit: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          points?: number | null
          question_type?: string | null
          quiz_id: string
          text: string
          time_limit?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          points?: number | null
          question_type?: string | null
          quiz_id?: string
          text?: string
          time_limit?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_public: boolean | null
          time_limit: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          is_admin: boolean | null
          is_approved: boolean | null
          is_super_admin: boolean | null
          name: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          is_admin?: boolean | null
          is_approved?: boolean | null
          is_super_admin?: boolean | null
          name?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          is_admin?: boolean | null
          is_approved?: boolean | null
          is_super_admin?: boolean | null
          name?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      active_sessions: {
        Row: {
          created_at: string | null
          game_pin: string | null
          host_name: string | null
          id: string | null
          player_count: number | null
          quiz_title: string | null
          session_type: string | null
          status: string | null
        }
        Relationships: []
      }
      quiz_details: {
        Row: {
          category: string | null
          created_at: string | null
          creator_email: string | null
          creator_name: string | null
          description: string | null
          difficulty: string | null
          id: string | null
          is_public: boolean | null
          question_count: number | null
          time_limit: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_player_score: {
        Args: { player_uuid: string; session_uuid: string }
        Returns: number
      }
      generate_game_pin: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_game_session_leaderboard: {
        Args: { session_uuid: string }
        Returns: {
          player_id: string
          player_name: string
          score: number
          correct_answers: number
          total_answers: number
          accuracy: number
          average_response_time: number
          rank: number
        }[]
      }
      get_quiz_stats: {
        Args: { quiz_uuid: string }
        Returns: Json
      }
      get_quiz_with_questions: {
        Args: { quiz_uuid: string }
        Returns: Json
      }
      get_session_results: {
        Args: { session_uuid: string; session_type?: string }
        Returns: Json
      }
      validate_quiz_for_session: {
        Args: { quiz_uuid: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
