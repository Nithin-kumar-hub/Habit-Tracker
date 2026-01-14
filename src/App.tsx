import { useEffect, useState } from 'react';
import { Plus, Target, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import type { Habit, HabitLog, HabitWithStats } from './types';
import { HabitCard } from './components/HabitCard';
import { AddHabitModal } from './components/AddHabitModal';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [habitsResult, logsResult] = await Promise.all([
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase.from('habit_logs').select('*'),
      ]);

      if (habitsResult.data) {
        const allLogs = logsResult.data || [];
        setLogs(allLogs);

        const habitsWithStats = habitsResult.data.map((habit) =>
          calculateHabitStats(habit, allLogs)
        );
        setHabits(habitsWithStats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHabitStats = (habit: Habit, allLogs: HabitLog[]): HabitWithStats => {
    const habitLogs = allLogs
      .filter((log) => log.habit_id === habit.id)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habitLogs.some((log) => log.completed_at === today);

    let currentStreak = 0;
    const logDates = habitLogs.map((log) => log.completed_at);
    const checkDate = new Date();

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (logDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today && !isCompletedToday) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...logDates].sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const daysSinceCreation = Math.max(
      1,
      Math.floor(
        (new Date().getTime() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    );
    const completionRate = Math.round((habitLogs.length / daysSinceCreation) * 100);

    return {
      ...habit,
      currentStreak,
      longestStreak,
      completionRate: Math.min(100, completionRate),
      isCompletedToday,
    };
  };

  const handleToggleHabit = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingLog = logs.find(
      (log) => log.habit_id === habitId && log.completed_at === today
    );

    try {
      if (existingLog) {
        await supabase.from('habit_logs').delete().eq('id', existingLog.id);
      } else {
        await supabase.from('habit_logs').insert({
          habit_id: habitId,
          completed_at: today,
        });
      }
      await loadData();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const handleAddHabit = async (habitData: {
    name: string;
    description: string;
    color: string;
    icon: string;
  }) => {
    try {
      await supabase.from('habits').insert({
        ...habitData,
        user_id: user!.id,
      });
      await loadData();
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      try {
        await supabase.from('habits').delete().eq('id', habitId);
        await loadData();
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Habit Tracker</h1>
                <p className="text-gray-600 text-sm mt-1">Build better habits, one day at a time</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {habits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Start Your Journey
              </h2>
              <p className="text-gray-600 mb-8">
                Create your first habit and begin tracking your daily progress. Small steps lead
                to big changes.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Create Your First Habit
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Habits ({habits.length})
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Add Habit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={handleToggleHabit}
                  onDelete={handleDeleteHabit}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <AddHabitModal onClose={() => setShowAddModal(false)} onAdd={handleAddHabit} />
      )}
    </div>
  );
}

export default App;
