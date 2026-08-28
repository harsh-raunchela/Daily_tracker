import React from 'react';
import { Sparkles, LayoutDashboard, Compass, Award, Calendar, Menu } from 'lucide-react';

export function Header({ currentTab, onMobileMenuClick, summaryData, viewMode, setViewMode }) {
  const tabTitles = {
    dashboard: '01 · Dashboard',
    habits: '02 · Habit Consistency Matrix',
    tasks: '03 · Task Stream',
    journal: '04 · Daily Reflection',
    analytics: '05 · Analytics & Formula Engine',
    rewards: '06 · Rewards & Milestones',
  };

  return (
    <header className="h-16 bg-[#0e1113]/90 backdrop-blur-md border-b border-[#262822] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-1.5 rounded text-[#7a7568] hover:text-[#cfc8ba] hover:bg-[#1b1f23]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="font-mono text-xs uppercase tracking-[0.24em] text-[#7a7568] hidden sm:block">
            TRACKER · OS
          </div>
          <span className="text-[#33352f] hidden sm:inline">/</span>
          <h2 className="font-mono text-xs sm:text-sm font-semibold text-[#cfc8ba] uppercase tracking-wider">
            {tabTitles[currentTab] || 'Dashboard'}
          </h2>
        </div>
      </div>

      {/* Right Controls: Story vs Workspace Switcher & Score Badge */}
      <div className="flex items-center gap-3">
        {/* Mode Switcher */}
        <div className="flex bg-[#121518] p-0.5 rounded border border-[#2b2e2b] text-[11px] font-mono">
          <button
            onClick={() => setViewMode('story')}
            className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 ${
              viewMode === 'story'
                ? 'bg-[#d9a441] text-[#12140f] font-bold shadow-sm'
                : 'text-[#7a7568] hover:text-[#cfc8ba]'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Story</span>
          </button>
          <button
            onClick={() => setViewMode('workspace')}
            className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 ${
              viewMode === 'workspace'
                ? 'bg-[#cfc8ba] text-[#0e1113] font-bold shadow-sm'
                : 'text-[#7a7568] hover:text-[#cfc8ba]'
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>Workspace</span>
          </button>
        </div>

        {summaryData && summaryData.monthlyScore !== undefined && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded border border-[#33352f] bg-[#121518] font-mono text-[11px] text-[#8fb896]">
            <Award className="w-3.5 h-3.5" />
            <span>Score: {summaryData.monthlyScore}/100</span>
          </div>
        )}
      </div>
    </header>
  );
}
