import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  X
} from 'lucide-react';
import { api } from '../api';
import { getTodayDate, getCurrentMonth } from '../utils/date';

export function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [calendarData, setCalendarData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitHistory, setHabitHistory] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Learning',
    target: 30,
    unit: 'minutes',
    difficulty: 3,
    frequency: 'daily',
    color: '#d9a441',
    description: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsRes, calRes] = await Promise.all([
        api.getHabits(getTodayDate()),
        api.getHabitCalendar(selectedMonth)
      ]);
      setHabits(habitsRes);
      setCalendarData(calRes);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const handleToggleDaily = async (habitId) => {
    try {
      await api.toggleHabitCompletion(habitId, { date: getTodayDate() });
      await loadData();
    } catch (err) {
      console.error('Toggle habit error:', err);
    }
  };

  const handleToggleDate = async (habitId, dateStr, currentCompleted) => {
    try {
      await api.toggleHabitCompletion(habitId, { date: dateStr, completed: !currentCompleted });
      await loadData();
    } catch (err) {
      console.error('Toggle date error:', err);
    }
  };

  const handleOpenModal = (habit = null) => {
    if (habit) {
      setEditingHabit(habit);
      setFormData({
        name: habit.name,
        category: habit.category,
        target: habit.target,
        unit: habit.unit,
        difficulty: habit.difficulty,
        frequency: habit.frequency,
        color: habit.color || '#d9a441',
        description: habit.description || ''
      });
    } else {
      setEditingHabit(null);
      setFormData({
        name: '',
        category: 'Learning',
        target: 30,
        unit: 'minutes',
        difficulty: 3,
        frequency: 'daily',
        color: '#d9a441',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmitHabit = async (e) => {
    e.preventDefault();
    try {
      if (editingHabit) {
        await api.updateHabit(editingHabit.id, formData);
      } else {
        await api.createHabit(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save habit error:', err);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await api.deleteHabit(habitId);
      if (selectedHabit && selectedHabit.id === habitId) setSelectedHabit(null);
      await loadData();
    } catch (err) {
      console.error('Delete habit error:', err);
    }
  };

  const handleViewHistory = async (habit) => {
    try {
      setSelectedHabit(habit);
      const res = await api.getHabitHistory(habit.id);
      setHabitHistory(res);
    } catch (err) {
      console.error('History load error:', err);
    }
  };

  const changeMonth = (offset) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 1 + offset, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const [currYear, currMonthIdx] = selectedMonth.split('-').map(Number);
  const formattedMonthTitle = `${monthNames[currMonthIdx - 1]} ${currYear}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#cfc8ba] uppercase font-mono tracking-wider">
            02 · Habit Consistency Matrix
          </h2>
          <p className="text-xs text-[#7a7568]">
            Preserving daily execution history across months and years.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#121518] p-0.5 rounded border border-[#2b2e2b] text-[11px] font-mono">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-[#d9a441] text-[#12140f] font-bold'
                  : 'text-[#7a7568] hover:text-[#cfc8ba]'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded transition-all ${
                viewMode === 'calendar'
                  ? 'bg-[#d9a441] text-[#12140f] font-bold'
                  : 'text-[#7a7568] hover:text-[#cfc8ba]'
              }`}
            >
              Monthly Matrix
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="btn-story accent text-xs py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="consider-card p-4 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 rounded border border-[#2b2e2b] hover:border-[#7a7568] text-[#cfc8ba]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-[#cfc8ba] uppercase tracking-wider">
            {formattedMonthTitle}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 rounded border border-[#2b2e2b] hover:border-[#7a7568] text-[#cfc8ba]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[#7a7568]">
          CONFIGURED HABITS: <strong className="text-[#cfc8ba]">{habits.length}</strong>
        </div>
      </div>

      {/* View Mode: List */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="consider-card p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleDaily(habit.id)}
                      className={`w-7 h-7 rounded border flex items-center justify-center transition-all ${
                        habit.todayCompleted
                          ? 'bg-[#8fb896] border-[#8fb896] text-[#0e1113]'
                          : 'border-[#4a4d46] text-transparent hover:border-[#d9a441]'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    <div>
                      <h3 className={`font-semibold text-sm ${habit.todayCompleted ? 'text-[#8fb896] line-through' : 'text-[#cfc8ba]'}`}>
                        {habit.name}
                      </h3>
                      <p className="text-xs text-[#7a7568]">
                        {habit.target} {habit.unit} • {habit.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(habit)}
                      className="p-1 text-[#7a7568] hover:text-[#cfc8ba]"
                      title="Edit Habit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-1 text-[#7a7568] hover:text-[#e06c58]"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {habit.description && (
                  <p className="text-xs text-[#7a7568] mt-2 line-clamp-1">
                    {habit.description}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#262822] flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-1.5 text-[#d9a441]">
                  <Flame className="w-3.5 h-3.5 fill-[#d9a441]" />
                  <span>{habit.currentStreak}d streak</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#171b1e] text-[#7a7568]">
                    Diff {habit.difficulty}/5
                  </span>
                  <button
                    onClick={() => handleViewHistory(habit)}
                    className="text-[#cfc8ba] hover:underline"
                  >
                    History
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Mode: Calendar Matrix */}
      {viewMode === 'calendar' && calendarData && (
        <div className="consider-card p-6 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[180px_repeat(31,minmax(22px,1fr))_60px] gap-1 items-center pb-3 border-b border-[#262822] font-mono text-[10px] uppercase tracking-wider text-[#7a7568]">
              <div>Habit</div>
              {Array.from({ length: calendarData.daysInMonth }, (_, i) => (
                <div key={i} className="text-center">
                  {i + 1}
                </div>
              ))}
              <div className="text-right">Rate</div>
            </div>

            <div className="space-y-2 pt-3 font-mono">
              {calendarData.habits.map(({ habit, days, consistencyRate }) => (
                <div 
                  key={habit.id}
                  className="grid grid-cols-[180px_repeat(31,minmax(22px,1fr))_60px] gap-1 items-center py-1 rounded hover:bg-[#171b1e]"
                >
                  <div className="text-xs text-[#cfc8ba] truncate pr-2">
                    {habit.name}
                  </div>

                  {Array.from({ length: calendarData.daysInMonth }, (_, i) => {
                    const dayKey = (i + 1) < 10 ? `0${i + 1}` : `${i + 1}`;
                    const dayRecord = days[dayKey];
                    const isDone = dayRecord && dayRecord.completed;
                    const dateStr = `${selectedMonth}-${dayKey}`;

                    return (
                      <button
                        key={i}
                        onClick={() => handleToggleDate(habit.id, dateStr, isDone)}
                        title={`${dateStr}: ${isDone ? 'Completed' : 'Missed'}`}
                        className={`h-5 w-full rounded flex items-center justify-center text-[9px] transition-all ${
                          isDone
                            ? 'bg-[#8fb896] text-[#0e1113] font-bold'
                            : 'bg-[#1b1f23] text-[#4a4d46] hover:bg-[#2b2e2b]'
                        }`}
                      >
                        {isDone ? '✓' : '·'}
                      </button>
                    );
                  })}

                  <div className="text-right font-bold text-xs text-[#d9a441]">
                    {consistencyRate}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Habit Details Drawer */}
      {selectedHabit && habitHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121518] border border-[#2b2e2b] rounded max-w-md w-full p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#cfc8ba]">
                  {selectedHabit.name}
                </h3>
                <p className="text-[11px] text-[#7a7568]">
                  {selectedHabit.category} • Target: {selectedHabit.target} {selectedHabit.unit}
                </p>
              </div>
              <button
                onClick={() => setSelectedHabit(null)}
                className="text-[#7a7568] hover:text-[#cfc8ba]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded bg-[#0e1113] border border-[#262822]">
                <p className="text-[9px] text-[#7a7568]">CURRENT STREAK</p>
                <p className="text-sm font-bold text-[#d9a441] mt-0.5">{habitHistory.currentStreak}d</p>
              </div>
              <div className="p-2.5 rounded bg-[#0e1113] border border-[#262822]">
                <p className="text-[9px] text-[#7a7568]">LONGEST</p>
                <p className="text-sm font-bold text-[#8fb896] mt-0.5">{habitHistory.longestStreak}d</p>
              </div>
              <div className="p-2.5 rounded bg-[#0e1113] border border-[#262822]">
                <p className="text-[9px] text-[#7a7568]">TOTAL DAYS</p>
                <p className="text-sm font-bold text-[#cfc8ba] mt-0.5">{habitHistory.totalCompleted}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[#7a7568] uppercase mb-1">Recent Completion Log</p>
              <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
                {habitHistory.records.slice(-10).reverse().map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-1.5 rounded bg-[#0e1113]">
                    <span className="text-[#cfc8ba]">{r.date}</span>
                    <span className={r.completed ? 'text-[#8fb896]' : 'text-[#e06c58]'}>
                      {r.completed ? 'Completed' : 'Missed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedHabit(null)}
              className="btn-story w-full justify-center text-xs py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121518] border border-[#2b2e2b] rounded max-w-md w-full p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#cfc8ba] uppercase">
                {editingHabit ? 'Edit Habit' : 'Configure New Habit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#7a7568] hover:text-[#cfc8ba]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitHabit} className="space-y-3">
              <div>
                <label className="block text-[#7a7568] uppercase mb-1">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 30 minutes"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#7a7568] uppercase mb-1">Target Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                    className="w-full p-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
                  />
                </div>
                <div>
                  <label className="block text-[#7a7568] uppercase mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="minutes, pages"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#7a7568] uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
                  >
                    <option value="Learning">Learning</option>
                    <option value="Health">Health</option>
                    <option value="Career">Career</option>
                    <option value="Mindset">Mindset</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#7a7568] uppercase mb-1">Difficulty (1–5)</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                    className="w-full p-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
                  >
                    <option value={1}>1 - Very Easy</option>
                    <option value={2}>2 - Easy</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - Hard</option>
                    <option value={5}>5 - High Effort</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-story flex-1 justify-center py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-story accent flex-1 justify-center py-2"
                >
                  {editingHabit ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
