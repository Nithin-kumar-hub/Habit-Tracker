export interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_at: string;
  notes: string;
  created_at: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  isCompletedToday: boolean;
}
