import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Flame, 
  Award, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  Gift
} from 'lucide-react';
import { api } from '../api';
import { getTodayDate, formatDisplayDate } from '../utils/date';

export function DashboardPage({ setCurrentTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard(getTodayDate());
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleToggleHabit = async (habitId) => {
    try {
      await api.toggleHabitCompletion(habitId, { date: getTodayDate() });
      await loadDashboard();
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await api.toggleTask(taskId);
      await loadDashboard();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] font-mono text-xs text-[#7a7568]">
        Loading dashboard telemetry...
      </div>
    );
  }

  const { summary, todayHabits, todayTasks, todayJournal, monthlyScore, nextReward } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* 3 Status Modules (How am I doing?) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Score Widget */}
        <div className="consider-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-[#d9a441]">
                {data?.month ? `${new Date(data.month + '-01').toLocaleString('default', { month: 'long' })} ${new Date(data.month + '-01').getFullYear()} Score` : 'Monthly Score'}
              </span>
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold border border-[#8fb896] text-[#8fb896]">
                {summary.monthlyLevel}
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1 font-mono">
              <span className="text-5xl font-bold text-[#cfc8ba]">
                {summary.monthlyScore}
              </span>
              <span className="text-sm text-[#7a7568]">/ 100</span>
            </div>
            <p className="text-xs text-[#b5afa2] leading-relaxed">
              Consistency (50%), difficulty (20%), streak (15%), and improvement (15%).
            </p>
          </div>

          <div className="pt-3 border-t border-[#262822] flex items-center justify-between font-mono text-xs">
            <button
              onClick={() => setCurrentTab('analytics')}
              className="text-[#d9a441] hover:underline flex items-center gap-1"
            >
              <span>Score breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-[#8fb896]">Active momentum</span>
          </div>
        </div>

        {/* Daily Execution Summary */}
        <div className="consider-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#7a7568]">
              Today's Execution
            </span>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="p-3 rounded bg-[#0e1113] border border-[#262822]">
                <p className="font-mono text-[10px] text-[#7a7568] uppercase">Habits Done</p>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-2xl font-bold text-[#cfc8ba]">{summary.habitsCompleted}</span>
                  <span className="text-xs text-[#7a7568]">/ {summary.habitsTotal}</span>
                </div>
                <div className="w-full bg-[#262822] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-[#d9a441] h-full rounded-full"
                    style={{ width: `${summary.habitCompletionRate}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded bg-[#0e1113] border border-[#262822]">
                <p className="font-mono text-[10px] text-[#7a7568] uppercase">Tasks Closed</p>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-2xl font-bold text-[#cfc8ba]">{summary.tasksCompleted}</span>
                  <span className="text-xs text-[#7a7568]">/ {summary.tasksTotal}</span>
                </div>
                <div className="w-full bg-[#262822] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-[#8fb896] h-full rounded-full"
                    style={{ width: `${summary.tasksTotal > 0 ? (summary.tasksCompleted / summary.tasksTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#262822] flex items-center justify-between font-mono text-xs text-[#7a7568]">
            <span>{summary.habitCompletionRate}% habit consistency</span>
            <button
              onClick={() => setCurrentTab('habits')}
              className="text-[#cfc8ba] hover:underline"
            >
              Full matrix
            </button>
          </div>
        </div>

        {/* Next Milestone Reward */}
        <div className="consider-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-[#7a7568]">
                Target Reward
              </span>
              <Gift className="w-4 h-4 text-[#d9a441]" />
            </div>
            {nextReward ? (
              <div className="mt-3 space-y-2">
                <h4 className="font-semibold text-sm text-[#cfc8ba]">
                  {nextReward.title}
                </h4>
                <p className="text-xs text-[#7a7568] line-clamp-2">
                  {nextReward.description || 'Milestone reward unlocked through consistent effort.'}
                </p>
                <div className="pt-2">
                  <div className="flex items-center justify-between font-mono text-xs text-[#7a7568] mb-1">
                    <span>Target: {nextReward.requiredScore} pts</span>
                    <span className="text-[#8fb896]">
                      {summary.monthlyScore >= nextReward.requiredScore ? '🎉 Unlocked' : `${nextReward.requiredScore - summary.monthlyScore} pts away`}
                    </span>
                  </div>
                  <div className="w-full bg-[#262822] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${summary.monthlyScore >= nextReward.requiredScore ? 'bg-[#8fb896]' : 'bg-[#d9a441]'}`}
                      style={{ width: `${Math.min(100, (summary.monthlyScore / nextReward.requiredScore) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 font-mono text-xs text-[#7a7568]">
                All rewards claimed or none active.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#262822]">
            <button
              onClick={() => setCurrentTab('rewards')}
              className="font-mono text-xs text-[#d9a441] hover:underline flex items-center gap-1"
            >
              <span>View all rewards</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: What do I need to do today? & Reflection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Today's Habits & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Habits */}
          <div className="consider-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#cfc8ba] uppercase font-mono tracking-wider">
                  Today's Habits
                </h3>
                <p className="text-xs text-[#7a7568]">Focus on one action at a time.</p>
              </div>
              <button
                onClick={() => setCurrentTab('habits')}
                className="font-mono text-xs text-[#d9a441] hover:underline flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayHabits && todayHabits.length > 0 ? (
                todayHabits.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`p-3.5 rounded border transition-all cursor-pointer select-none flex items-center justify-between ${
                      habit.completed
                        ? 'bg-[#131b15] border-[#25422b]'
                        : 'bg-[#0e1113] border-[#2b2e2b] hover:border-[#7a7568]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                          habit.completed
                            ? 'bg-[#8fb896] border-[#8fb896] text-[#0e1113]'
                            : 'border-[#4a4d46] text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${habit.completed ? 'line-through text-[#8fb896]' : 'text-[#cfc8ba]'}`}>
                          {habit.name}
                        </p>
                        <p className="text-[11px] text-[#7a7568]">
                          {habit.target} {habit.unit} • {habit.category}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-[#7a7568] px-1.5 py-0.5 rounded bg-[#171b1e]">
                      Diff {habit.difficulty}/5
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 font-mono text-xs text-[#7a7568]">
                  No habits configured yet.
                </div>
              )}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="consider-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#cfc8ba] uppercase font-mono tracking-wider">
                  Today's Task Stream
                </h3>
                <p className="text-xs text-[#7a7568]">High leverage priorities for today.</p>
              </div>
              <button
                onClick={() => setCurrentTab('tasks')}
                className="font-mono text-xs text-[#d9a441] hover:underline flex items-center gap-1"
              >
                <span>All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {todayTasks && todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3 rounded border transition-all cursor-pointer flex items-center justify-between ${
                      task.completed
                        ? 'bg-[#101412] border-[#1d2b20] opacity-60'
                        : 'bg-[#0e1113] border-[#2b2e2b] hover:border-[#7a7568]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          task.completed
                            ? 'bg-[#8fb896] border-[#8fb896] text-[#0e1113]'
                            : 'border-[#4a4d46]'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${task.completed ? 'line-through text-[#7a7568]' : 'text-[#cfc8ba]'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-[#7a7568] truncate max-w-md">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border ${
                      task.priority === 'high'
                        ? 'border-[#7a3228] text-[#e06c58]'
                        : task.priority === 'medium'
                        ? 'border-[#735928] text-[#d9a441]'
                        : 'border-[#33352f] text-[#7a7568]'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 font-mono text-xs text-[#7a7568]">
                  No pending tasks for today.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: How am I feeling? (Daily Reflection) */}
        <div className="space-y-6">
          <div className="consider-card p-6 flex flex-col justify-between h-full min-h-[380px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-widest text-[#7a7568]">
                  Daily Reflection
                </span>
                <BookOpen className="w-4 h-4 text-[#d9a441]" />
              </div>

              {todayJournal ? (
                <div className="space-y-3 mt-4">
                  <div className="p-4 rounded border border-[#2b2e2b] bg-[#0e1113]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-xs text-[#cfc8ba]">
                        {todayJournal.title}
                      </h4>
                      <span className="font-mono text-[10px] text-[#d9a441]">
                        Mood {todayJournal.mood}/5 • Energy {todayJournal.energy}/10
                      </span>
                    </div>
                    <p className="text-xs text-[#b5afa2] font-mono leading-relaxed line-clamp-4">
                      "{todayJournal.body}"
                    </p>

                    {todayJournal.tags && todayJournal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-[#262822]">
                        {todayJournal.tags.map((t, idx) => (
                          <span key={idx} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#171b1e] text-[#8fb896]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-center space-y-3 py-6">
                  <BookOpen className="w-8 h-8 text-[#7a7568] mx-auto" />
                  <h4 className="font-mono text-xs font-semibold text-[#cfc8ba] uppercase">
                    Record Today's Reflection
                  </h4>
                  <p className="text-xs text-[#7a7568] max-w-xs mx-auto">
                    Take 60 seconds to note what worked and your energy levels.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-6 border-t border-[#262822]">
              <button
                onClick={() => setCurrentTab('journal')}
                className="btn-story accent w-full justify-center text-xs"
              >
                <span>{todayJournal ? 'Edit Today’s Journal' : 'Write Reflection'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
