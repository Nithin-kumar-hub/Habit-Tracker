import { CheckCircle2, Circle, Flame, TrendingUp } from 'lucide-react';
import type { HabitWithStats } from '../types';

interface HabitCardProps {
  habit: HabitWithStats;
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
      style={{ borderLeftWidth: '4px', borderLeftColor: habit.color }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{habit.name}</h3>
          {habit.description && (
            <p className="text-sm text-gray-500">{habit.description}</p>
          )}
        </div>
        <button
          onClick={() => onToggle(habit.id)}
          className="flex-shrink-0 ml-4 transition-all duration-200 hover:scale-110"
        >
          {habit.isCompletedToday ? (
            <CheckCircle2
              className="w-8 h-8 transition-colors"
              style={{ color: habit.color }}
              fill={habit.color}
            />
          ) : (
            <Circle className="w-8 h-8 text-gray-300 hover:text-gray-400" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{habit.currentStreak}</span> day streak
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{habit.completionRate}%</span> completion
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(habit.id)}
        className="mt-4 text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        Delete habit
      </button>
    </div>
  );
}
