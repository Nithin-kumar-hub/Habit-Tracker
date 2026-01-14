export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string
          name: string
          description: string
          color: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          color?: string
          icon?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          icon?: string
          created_at?: string
        }
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          completed_at: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          completed_at?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          completed_at?: string
          notes?: string
          created_at?: string
        }
      }
    }
  }
}
