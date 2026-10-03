import React, { useState, useEffect } from 'react';
import { 
  Check, Plus, Settings, X, Calendar as CalendarIcon, 
  Droplets, BookOpen, Dumbbell, Code, Moon, Flame, TrendingUp 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ConsistencyOverview from '../components/analytics/ConsistencyOverview';

const ICONS = {
  Droplets: <Droplets className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  Moon: <Moon className="w-5 h-5" />
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  
  const [habits, setHabits] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [performance, setPerformance] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Form states for New Habit
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitTarget, setNewHabitTarget] = useState('');
  const [newHabitTargetUnit, setNewHabitTargetUnit] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [habitsData, dashData, weeklyAnalytics, perfData] = await Promise.all([
        api.getHabits(),
        api.getDashboard(),
        api.getWeeklyAnalytics(),
        api.getHabitPerformance()
      ]);
      
      setHabits(habitsData);
      setDashboard(dashData.summary || dashData);
      
      const formattedWeekly = weeklyAnalytics.map(item => {
        const dateObj = new Date(item.date);
        return {
          day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          progress: item.completion_percentage || 0
        };
      });
      setWeeklyData(formattedWeekly);
      setPerformance(perfData);
    } catch (err) {
      setError('Failed to load dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName) return;
    setIsSubmitting(true);
    try {
      await api.createHabit({
        name: newHabitName,
        description: newHabitDesc,
        target: parseInt(newHabitTarget) || 1,
        target_unit: newHabitTargetUnit || 'times',
        frequency: newHabitFreq,
        icon: 'Check',
        color: '#E4FF30'
      });
      setIsAddModalOpen(false);
      setNewHabitName('');
      setNewHabitDesc('');
      setNewHabitTarget('');
      setNewHabitTargetUnit('');
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to create habit: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async (habitId, isCurrentlyCompleted) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      if (isCurrentlyCompleted) {
        await api.uncompleteHabit(habitId, today);
      } else {
        await api.completeHabit(habitId, today);
      }
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to update habit status.');
    }
  };

  const handleDelete = async (habitId) => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      try {
        await api.deleteHabit(habitId);
        await fetchDashboardData();
      } catch (err) {
        alert('Failed to delete habit.');
      }
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-navy-700 border-t-lime-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    total_habits = 0,
    completed_today = 0,
    completion_percentage = 0,
    current_streak = 0,
    weekly_consistency = 0,
    best_streak = 0
  } = dashboard || {};

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-cream-200">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center text-navy-900 font-bold text-xl">
            H
          </div>
          <div>
            <h1 className="text-xl font-bold text-cream-200">HabitFlow</h1>
            <p className="text-sm text-blue-400">Build consistency, one day at a time.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
          <span className="text-sm text-purple-200 hidden md:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 bg-navy-800 rounded-full flex items-center justify-center border-2 border-purple-500 hover:border-lime-400 transition-colors cursor-pointer focus:outline-none"
          >
            <span className="font-bold text-sm uppercase">{user?.name ? user.name.slice(0, 2) : 'US'}</span>
          </button>
          
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-navy-800 rounded-xl border border-navy-700 shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-navy-700">
                <p className="text-sm text-cream-200 font-bold">{user?.name}</p>
                <p className="text-xs text-blue-400 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-navy-700 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="bg-navy-800 rounded-3xl p-8 relative overflow-hidden card-hover border border-navy-700 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Good evening, {user?.name} 👋</h2>
            <p className="text-blue-400 text-lg mb-6">Your habits, your progress. You're building a strong routine. Keep going.</p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-navy-900 px-4 py-2 rounded-lg border border-navy-700">
                <span className="text-sm text-cream-200/60 block">Today</span>
                <span className="font-bold text-xl text-lime-400">{completed_today} / {total_habits}</span>
              </div>
              <div className="bg-navy-900 px-4 py-2 rounded-lg border border-navy-700">
                <span className="text-sm text-cream-200/60 block">Completion</span>
                <span className="font-bold text-xl text-blue-500">{completion_percentage}%</span>
              </div>
              <div className="bg-navy-900 px-4 py-2 rounded-lg border border-navy-700 flex items-center gap-2">
                <div>
                  <span className="text-sm text-cream-200/60 block">Streak</span>
                  <span className="font-bold text-xl text-purple-500">{current_streak} Days</span>
                </div>
                <Flame className="text-purple-500" />
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-lime-400 hover:bg-lime-500 text-navy-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(228,255,48,0.3)] hover:shadow-[0_0_30px_rgba(228,255,48,0.5)] z-10 relative"
          >
            <Plus className="w-5 h-5" /> Add Habit
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </section>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-xl font-bold mb-4 text-cream-200 flex items-center gap-2">
              <Check className="text-lime-400" /> Today's Habits
            </h3>
            
            {habits.length === 0 ? (
              <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8 text-center">
                <h4 className="text-xl font-bold text-cream-200 mb-2">Start building better habits.</h4>
                <p className="text-blue-400 mb-6">Create your first habit and begin tracking your progress.</p>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-navy-900 hover:bg-navy-700 text-lime-400 border border-lime-400/50 px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" /> Create First Habit
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map(habit => {
                  const isCompleted = habit.completed_today === true || habit.completed_today === "true";
                  return (
                    <div key={habit.id} className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${isCompleted ? 'bg-navy-800/80 border-lime-400/30' : 'bg-navy-800 border-navy-700'} hover:border-blue-500/50 card-hover`}>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleComplete(habit.id, isCompleted)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-lime-400 text-navy-900 shadow-[0_0_15px_rgba(228,255,48,0.4)] scale-110' : 'bg-navy-900 border-2 border-navy-600 text-cream-200/20 hover:border-lime-400/50'}`}
                        >
                          {isCompleted && <Check className="w-6 h-6 animate-[pulse_0.3s_ease-in-out]" />}
                        </button>
                        <div>
                          <h4 className={`font-bold text-lg transition-colors ${isCompleted ? 'text-lime-400' : 'text-cream-200'}`}>{habit.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-blue-400 mt-1">
                            <span className="flex items-center gap-1">{ICONS[habit.icon] || <Check className="w-4 h-4"/>} {habit.target} {habit.target_unit}</span>
                            <span className="w-1 h-1 bg-navy-600 rounded-full"></span>
                            <span className="flex items-center gap-1 text-purple-400"><Flame className="w-3 h-3"/> {habit.current_streak || 0}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(habit.id)} className="text-red-400/60 hover:text-red-400 p-2 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <ConsistencyOverview updateTrigger={habits} />
        </div>

        <div className="space-y-8">
          
          <section className="bg-gradient-to-br from-purple-800/40 to-navy-800 rounded-3xl p-6 border border-purple-500/30 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden card-hover">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <Flame className="w-16 h-16 text-lime-400 mb-2 drop-shadow-[0_0_15px_rgba(228,255,48,0.5)]" />
            <h3 className="text-4xl font-black text-cream-200 mb-1">{current_streak} Days</h3>
            <p className="text-blue-400 font-medium mb-4">Current Streak</p>
            <div className="w-full flex justify-between px-4 py-3 bg-navy-900/50 rounded-xl border border-navy-700/50 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-cream-200/60">Best</span>
                <span className="font-bold text-cream-200">{best_streak}</span>
              </div>
              <div className="w-px bg-navy-700"></div>
              <div className="flex flex-col items-center">
                <span className="text-cream-200/60">Consistency</span>
                <span className="font-bold text-cream-200">{weekly_consistency}%</span>
              </div>
            </div>
          </section>

          <section className="bg-navy-800 rounded-3xl p-6 border border-navy-700 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-cream-200">Habit Performance</h3>
            <div className="space-y-4">
              {performance.length === 0 && <p className="text-sm text-blue-400">No performance data yet.</p>}
              {performance.map(item => (
                <div key={item.habit_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-cream-200">{item.habit_name}</span>
                    <span className="text-lime-400 font-bold">{item.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-navy-900 rounded-full h-2">
                    <div 
                      className="bg-[#7BC9FF] h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${item.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-navy-800 rounded-3xl p-6 border border-navy-700 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-cream-200">Consistency</h3>
            <div className="flex justify-between text-xs text-blue-400 mb-2 px-2">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div className="space-y-2">
              {habits.slice(0, 4).map(habit => (
                <div key={habit.id} className="flex justify-between items-center group cursor-help">
                  <div className="flex gap-1 w-full justify-between">
                    {[0, 1, 2, 3, 4, 5, 6].map(i => {
                      const completed = habit.recent_completions ? habit.recent_completions[i] : false;
                      let bgClass = "bg-navy-900";
                      if (completed) bgClass = "bg-lime-400 shadow-[0_0_8px_rgba(228,255,48,0.3)]";
                      
                      return (
                        <div key={i} className={`w-8 h-8 rounded-md ${bgClass} border border-navy-700/50 transition-colors duration-300 hover:border-cream-200`}></div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateHabit} className="bg-navy-800 rounded-3xl p-6 md:p-8 w-full max-w-md border border-navy-700 shadow-2xl scale-100 transition-transform">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Habit</h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-cream-200/50 hover:text-cream-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-400 mb-1">Habit Name</label>
                <input 
                  type="text" 
                  required
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Read for 20 minutes" 
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-cream-200 focus:outline-none focus:border-lime-400 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-400 mb-1">Description (Optional)</label>
                <input 
                  type="text" 
                  value={newHabitDesc}
                  onChange={(e) => setNewHabitDesc(e.target.value)}
                  placeholder="Why do you want to build this habit?" 
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-cream-200 focus:outline-none focus:border-lime-400 transition-colors" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-400 mb-1">Target</label>
                  <input 
                    type="number" 
                    value={newHabitTarget}
                    onChange={(e) => setNewHabitTarget(e.target.value)}
                    placeholder="e.g. 20" 
                    className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-cream-200 focus:outline-none focus:border-lime-400 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-400 mb-1">Unit</label>
                  <input 
                    type="text" 
                    value={newHabitTargetUnit}
                    onChange={(e) => setNewHabitTargetUnit(e.target.value)}
                    placeholder="e.g. mins" 
                    className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-cream-200 focus:outline-none focus:border-lime-400 transition-colors" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-blue-400 mb-1">Frequency</label>
                  <select 
                    value={newHabitFreq}
                    onChange={(e) => setNewHabitFreq(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-cream-200 focus:outline-none focus:border-lime-400 transition-colors appearance-none"
                  >
                    <option value="daily">Every day</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-navy-600 font-bold text-cream-200 hover:bg-navy-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-lime-400 hover:bg-lime-500 text-navy-900 font-bold transition-colors shadow-[0_0_15px_rgba(228,255,48,0.2)] hover:shadow-[0_0_20px_rgba(228,255,48,0.4)] disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Habit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
