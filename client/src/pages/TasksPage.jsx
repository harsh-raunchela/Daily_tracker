import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Trash2, 
  Search,
  Check,
  X
} from 'lucide-react';
import { api } from '../api';

const PRIORITY_STYLES = {
  high:   { label: 'HIGH',   bg: 'bg-[#3a1a1a]', text: 'text-[#e06c58]', border: 'border-[#5a2020]' },
  medium: { label: 'MED',    bg: 'bg-[#2e2810]', text: 'text-[#d9a441]', border: 'border-[#4a3b18]' },
  low:    { label: 'LOW',    bg: 'bg-[#171b23]', text: 'text-[#7a7568]', border: 'border-[#262822]' },
};

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [quickCategory, setQuickCategory] = useState('Work');
  const [quickDueDate, setQuickDueDate] = useState('2026-08-26');

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks({
        filter: activeFilter,
        search: searchQuery,
        date: '2026-08-26'
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, [activeFilter, searchQuery]);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    try {
      await api.createTask({
        title: quickTitle,
        priority: quickPriority,
        category: quickCategory,
        dueDate: quickDueDate,
        recurring: 'none'
      });
      setQuickTitle('');
      await loadTasks();
    } catch (err) {
      console.error('Create task error:', err);
    }
  };

  const handleToggle = async (taskId) => {
    try {
      await api.toggleTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error('Toggle task error:', err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'completed', label: 'Done' },
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#cfc8ba] uppercase font-mono tracking-wider">
            03 · Task Stream
          </h2>
          <p className="text-xs text-[#7a7568]">
            Capture daily priorities with clear execution statuses.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-[#7a7568]">
          <span className="text-[#8fb896] font-bold">{completedCount}</span> done
          &nbsp;·&nbsp;
          <span className="text-[#d9a441] font-bold">{pendingCount}</span> pending
        </div>
      </div>

      {/* Quick Add */}
      <div className="consider-card p-4">
        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="+ Quick-add task…"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] text-xs placeholder-[#4a4d46] focus:outline-none focus:border-[#d9a441] font-mono"
          />

          <div className="flex items-center gap-2">
            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value)}
              className="px-2 py-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] text-xs font-mono focus:outline-none"
            >
              <option value="high">High</option>
              <option value="medium">Med</option>
              <option value="low">Low</option>
            </select>

            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="px-2 py-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] text-xs font-mono focus:outline-none"
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
              <option value="Study">Study</option>
            </select>

            <input
              type="date"
              value={quickDueDate}
              onChange={(e) => setQuickDueDate(e.target.value)}
              className="px-2 py-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] text-xs font-mono focus:outline-none"
            />

            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="btn-story accent text-xs py-2 px-4 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex bg-[#121518] p-0.5 rounded border border-[#2b2e2b] text-[11px] font-mono overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1 rounded whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#d9a441] text-[#12140f] font-bold'
                  : 'text-[#7a7568] hover:text-[#cfc8ba]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4d46]" />
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded bg-[#0e1113] border border-[#262822] text-xs text-[#cfc8ba] font-mono focus:outline-none focus:border-[#d9a441] w-48"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => {
            const isOverdue = !task.completed && task.dueDate < '2026-08-26';
            const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.low;

            return (
              <div
                key={task.id}
                className={`consider-card px-4 py-3 flex items-center justify-between transition-all group ${
                  task.completed ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                      task.completed
                        ? 'bg-[#8fb896] border-[#8fb896] text-[#0e1113]'
                        : 'border-[#4a4d46] text-transparent hover:border-[#d9a441]'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium leading-tight truncate font-mono ${
                      task.completed
                        ? 'line-through text-[#4a4d46]'
                        : 'text-[#cfc8ba]'
                    }`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[11px] text-[#7a7568] truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-shrink-0 font-mono">
                  <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#171b1e] text-[#7a7568]">
                    {task.category}
                  </span>

                  <span className={`text-[10px] flex items-center gap-1 ${
                    isOverdue ? 'text-[#e06c58]' : 'text-[#7a7568]'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    {task.dueDate === '2026-08-26' ? 'Today' : task.dueDate}
                  </span>

                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${ps.bg} ${ps.text} ${ps.border}`}>
                    {ps.label}
                  </span>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 text-[#4a4d46] hover:text-[#e06c58] opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete task"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="consider-card p-12 text-center space-y-3 font-mono">
            <CheckCircle2 className="w-8 h-8 text-[#2b2e2b] mx-auto" />
            <h4 className="font-bold text-sm text-[#cfc8ba]">No tasks found</h4>
            <p className="text-xs text-[#7a7568] max-w-sm mx-auto">
              Use the quick-add bar above to capture your next priority.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
