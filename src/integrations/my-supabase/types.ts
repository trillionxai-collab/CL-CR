// Hand-authored types for the user's own Supabase project.
// Mirrors the schema in /schema.sql at the repo root.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      journey_users: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone_number: string;
          date_of_birth: string | null;
          gender: string | null;
          lifestyle: string | null;
          open_mind_consent: boolean;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          phone_number: string;
          date_of_birth?: string | null;
          gender?: string | null;
          lifestyle?: string | null;
          open_mind_consent?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["journey_users"]["Insert"]>;
        Relationships: [];
      };
      otp_verifications: {
        Row: {
          id: string;
          phone_number: string;
          otp_hash: string;
          expires_at: string;
          attempts: number;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_number: string;
          otp_hash: string;
          expires_at: string;
          attempts?: number;
          verified?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["otp_verifications"]["Insert"]>;
        Relationships: [];
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token_hash: string;
          device_info: string | null;
          ip_address: string | null;
          expires_at: string;
          created_at: string;
          last_active_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token_hash: string;
          device_info?: string | null;
          ip_address?: string | null;
          expires_at: string;
          created_at?: string;
          last_active_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_sessions"]["Insert"]>;
        Relationships: [];
      };
      journey_progress: {
        Row: {
          id: string;
          user_id: string;
          current_level: number;
          completion_percentage: number;
          total_watch_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_level?: number;
          completion_percentage?: number;
          total_watch_time?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["journey_progress"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
