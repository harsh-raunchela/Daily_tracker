import React from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  ListTodo, 
  BookOpen, 
  BarChart3, 
  Gift, 
  LogOut,
  Flame,
  Compass,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ currentTab, setCurrentTab, viewMode, setViewMode }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, num: '01' },
    { id: 'habits', label: 'Habit Matrix', icon: CheckCircle2, num: '02' },
    { id: 'tasks', label: 'Task Stream', icon: ListTodo, num: '03' },
    { id: 'journal', label: 'Daily Journal', icon: BookOpen, num: '04' },
    { id: 'analytics', label: 'Scoring Engine', icon: BarChart3, num: '05' },
    { id: 'rewards', label: 'Rewards', icon: Gift, num: '06' },
  ];

  return (
    <aside className="w-64 bg-[#0e1113] border-r border-[#262822] flex flex-col justify-between h-screen sticky top-0 transition-colors select-none z-30 font-sans">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-[#262822]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#d9a441] flex items-center justify-center text-[#12140f] font-bold font-mono text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-[#cfc8ba] uppercase font-mono">
                Tracker · OS
              </h1>
              <p className="text-[10px] font-mono text-[#7a7568] tracking-widest uppercase">
                Track. Reflect. Improve.
              </p>
            </div>
          </div>
        </div>

        {/* Story Flow Shortcut */}
        <div className="px-4 pt-4">
          <button
            onClick={() => setViewMode(viewMode === 'story' ? 'workspace' : 'story')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono border transition-all ${
              viewMode === 'story'
                ? 'bg-[#1e1c14] border-[#d9a441] text-[#d9a441]'
                : 'bg-[#121518] border-[#2b2e2b] text-[#7a7568] hover:border-[#7a7568] hover:text-[#cfc8ba]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Story</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest px-1 py-0.5 rounded bg-[#262822] text-[#cfc8ba]">
              {viewMode === 'story' ? 'ACTIVE' : 'EXPLORE'}
            </span>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#7a7568] px-3 pb-1">
            Workspace Modules
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = viewMode === 'workspace' && currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setViewMode('workspace');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-[#171b1e] border-l-2 border-[#d9a441] text-[#cfc8ba] font-bold'
                    : 'text-[#7a7568] hover:bg-[#121518] hover:text-[#cfc8ba]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#d9a441]' : 'text-[#7a7568]'}`} />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] text-[#4a4d46] font-mono">{item.num}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Footer Actions */}
      <div className="p-4 border-t border-[#262822] space-y-3">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-6 h-6 rounded bg-[#262822] border border-[#33352f] flex items-center justify-center text-[#cfc8ba] font-mono text-[10px]">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono font-medium text-[#cfc8ba] truncate">
                {user.name}
              </p>
              <p className="text-[9px] font-mono text-[#7a7568] truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded border border-[#2b2e2b] bg-[#121518] hover:border-[#7a3228] text-[11px] font-mono text-[#7a7568] hover:text-[#e06c58] transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
}
