import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StoryMode } from './components/StoryMode';
import { DashboardPage } from './pages/DashboardPage';
import { HabitsPage } from './pages/HabitsPage';
import { TasksPage } from './pages/TasksPage';
import { JournalPage } from './pages/JournalPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RewardsPage } from './pages/RewardsPage';
import { api } from './api';

export function App() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('story'); // 'story' | 'workspace'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchSummary = () => {
    if (user) {
      api.getDashboard('2026-08-26')
        .then(res => setDashboardData(res))
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [user, currentTab, viewMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1113] text-[#cfc8ba] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#d9a441] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest text-[#7a7568]">Initialising System Telemetry...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderActiveWorkspacePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage setCurrentTab={setCurrentTab} />;
      case 'habits':
        return <HabitsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'journal':
        return <JournalPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'rewards':
        return <RewardsPage />;
      default:
        return <DashboardPage setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1113] text-[#cfc8ba] flex font-sans">
      {/* Desktop Sidebar (visible in workspace mode or collapsable) */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 bg-[#0e1113] h-full shadow-2xl">
            <Sidebar
              currentTab={currentTab}
              setCurrentTab={(tab) => {
                setCurrentTab(tab);
                setMobileMenuOpen(false);
              }}
              viewMode={viewMode}
              setViewMode={(m) => {
                setViewMode(m);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          currentTab={currentTab}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
          summaryData={dashboardData ? { monthlyScore: dashboardData.summary.monthlyScore } : null}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <main className="flex-1">
          {viewMode === 'story' ? (
            <StoryMode
              onOpenWorkspace={() => setViewMode('workspace')}
              dashboardData={dashboardData}
              onRefresh={fetchSummary}
            />
          ) : (
            <div className="p-4 sm:p-6 md:p-8">
              {renderActiveWorkspacePage()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
