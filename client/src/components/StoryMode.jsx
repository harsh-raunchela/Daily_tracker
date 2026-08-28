import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Flame, 
  Zap, 
  Calendar, 
  Award, 
  ChevronDown,
  Gift,
  Plus
} from 'lucide-react';
import { api } from '../api';

export function StoryMode({ onOpenWorkspace, dashboardData, onRefresh }) {
  const [activeChapter, setActiveChapter] = useState('01 · inception');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [localHabits, setLocalHabits] = useState([]);
  const [localTasks, setLocalTasks] = useState([]);
  const [journalMood, setJournalMood] = useState(4);
  const [journalEnergy, setJournalEnergy] = useState(8);
  const [journalText, setJournalText] = useState('Steady progress today. Focused deeply on architecture without morning interruptions.');
  const [savedJournal, setSavedJournal] = useState(false);
  const [counterMultiplier, setCounterMultiplier] = useState(26);

  // Scoring engine interactive simulation
  const [simConsistency, setSimConsistency] = useState(90);
  const [simDifficulty, setSimDifficulty] = useState(70);
  const [simStreak, setSimStreak] = useState(85);
  const [simImprovement, setSimImprovement] = useState(95);

  const containerRef = useRef(null);

  useEffect(() => {
    if (dashboardData) {
      setLocalHabits(dashboardData.todayHabits || []);
      setLocalTasks(dashboardData.todayTasks || []);
      if (dashboardData.todayJournal) {
        setJournalMood(dashboardData.todayJournal.mood || 4);
        setJournalEnergy(dashboardData.todayJournal.energy || 8);
        setJournalText(dashboardData.todayJournal.body || '');
      }
    }
  }, [dashboardData]);

  // Scroll listener for chapter scrubber
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, window.scrollY / (totalHeight || 1)));
      setScrollProgress(progress);

      // Determine chapter
      if (progress < 0.15) setActiveChapter('00 · inception');
      else if (progress < 0.32) setActiveChapter('01 · today’s habits');
      else if (progress < 0.50) setActiveChapter('02 · tasks');
      else if (progress < 0.68) setActiveChapter('03 · reflection');
      else if (progress < 0.84) setActiveChapter('04 · scoring engine');
      else setActiveChapter('05 · the receipt');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleHabit = async (habitId) => {
    try {
      await api.toggleHabitCompletion(habitId, { date: '2026-08-26' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await api.toggleTask(taskId);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveJournal = async () => {
    try {
      await api.saveJournalEntry({
        date: '2026-08-26',
        title: 'Daily Reflection',
        body: journalText,
        mood: journalMood,
        energy: journalEnergy,
        tags: ['focus', 'habits', 'story']
      });
      setSavedJournal(true);
      setTimeout(() => setSavedJournal(false), 2500);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate simulated score
  const simScore = Math.round(
    (simConsistency * 0.50) +
    (simDifficulty * 0.20) +
    (simStreak * 0.15) +
    (simImprovement * 0.15)
  );

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#0e1113] text-[#cfc8ba] select-none font-sans">
      
      {/* Fixed Ambient Scrubber & Chapter Indicator (exact Consider Digital style) */}
      <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end gap-1.5 pointer-events-none hidden sm:flex">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7a7568]">
          {activeChapter}
        </div>
        <svg width="220" height="14" viewBox="0 0 220 14" className="overflow-visible">
          {Array.from({ length: 36 }).map((_, i) => (
            <line
              key={i}
              x1={2 + i * 6}
              y1={i % 5 === 0 ? 2 : 5}
              x2={2 + i * 6}
              y2={i % 5 === 0 ? 12 : 9}
              stroke="#2e322f"
              strokeWidth="1"
            />
          ))}
          <line
            x1={2 + scrollProgress * 216}
            y1={0}
            x2={2 + scrollProgress * 216}
            y2={14}
            stroke="#d9a441"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* ════════════════════ SCENE 0: HERO ════════════════════ */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 relative border-b border-[#262822]/60 overflow-hidden">
        {/* Background Circuit SVG */}
        <svg className="art absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          <path className="hair" d="M-20,440 L280,440 C330,440 340,400 375,400 C410,400 420,470 455,470 C490,470 500,400 535,400 C570,400 580,440 630,440 L1020,440" />
          <circle className="adot" cx="375" cy="400" r="4" />
          <circle className="adot" cx="535" cy="400" r="4" />
          <circle className="mdot" cx="455" cy="470" r="3.5" />
          <line className="hair" x1="630" y1="440" x2="780" y2="290" />
          <circle className="dot" cx="780" cy="290" r="3" />
        </svg>

        <div className="max-w-3xl relative z-10 space-y-6 pt-16">
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#d9a441] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d9a441] inline-block animate-pulse"></span>
            Personal Operating System
          </p>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#cfc8ba] leading-[1.05] text-balance text-halo">
            From intention<br />
            to execution.
          </h1>

          <p className="text-base sm:text-lg text-[#b5afa2] leading-relaxed max-w-xl font-light">
            Every day you wake up with a finite store of attention and energy. This is the operating system designed to track what you do, understand your patterns, and reward meaningful consistency.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenWorkspace}
              className="btn-story accent"
            >
              <span>Open Full Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#s-habits"
              className="btn-story"
            >
              <span>Explore The Flow</span>
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          <div className="pt-8 border-l border-[#33352f] pl-4 font-mono text-xs text-[#7a7568] space-y-1">
            <p>four core pillars · <b>habits · tasks · journal · transparent scoring</b></p>
            <p>August 2026 telemetry · <b className="text-[#8fb896]">92/100 Elite Consistency</b></p>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-6 sm:left-12 font-mono text-[11px] uppercase tracking-[0.26em] text-[#7a7568] flex items-center gap-3">
          <span>Scroll</span>
          <div className="w-[1px] h-10 bg-[#7a7568] scroll-line-anim"></div>
        </div>
      </section>

      {/* ════════════════════ SCENE 01: TODAY'S HABITS ════════════════════ */}
      <section id="s-habits" className="min-h-screen py-24 px-6 sm:px-12 md:px-20 border-b border-[#262822]/60 relative flex items-center">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#7a7568]">
              01 · The Daily Spark
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#cfc8ba] leading-tight text-halo">
              It starts at<br />
              the atomic habit.
            </h2>
            <p className="text-sm sm:text-base text-[#b5afa2] leading-relaxed">
              Real progress is not built on burst motivation. It is the steady accumulation of small daily actions—reading, workout, coding, meditation—each creating an indelible historical record in your personal database.
            </p>

            {/* Telemetry Mix Bars (Consider style) */}
            <div className="pt-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#7a7568] mb-2">
                Today's Habit Telemetry
              </p>
              <div className="space-y-1 max-w-md">
                {localHabits.map((habit) => (
                  <div key={habit.id} className={`mix-row ${habit.completed ? 'moss' : 'accent'}`}>
                    <span className="lbl truncate text-[11px]">{habit.name}</span>
                    <div className="track">
                      <div
                        className="bar"
                        style={{ width: habit.completed ? '100%' : '0%' }}
                      />
                    </div>
                    <span className="pct text-[11px]">{habit.completed ? '100%' : '0%'}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="font-mono text-xs text-[#7a7568] border-l border-[#33352f] pl-3">
              Click any habit card on the right to <b className="text-[#d9a441]">toggle live completion</b> on the backend.
            </p>
          </div>

          {/* Interactive Cards */}
          <div className="space-y-3">
            {localHabits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className={`p-4 rounded border transition-all cursor-pointer select-none flex items-center justify-between ${
                  habit.completed
                    ? 'bg-[#131b15] border-[#25422b]'
                    : 'bg-[#121518] border-[#2b2e2b] hover:border-[#7a7568]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                    habit.completed
                      ? 'bg-[#8fb896] border-[#8fb896] text-[#0e1113]'
                      : 'border-[#4a4d46] text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${habit.completed ? 'text-[#8fb896] line-through' : 'text-[#cfc8ba]'}`}>
                      {habit.name}
                    </h3>
                    <p className="text-xs text-[#7a7568]">
                      {habit.target} {habit.unit} • {habit.category} • Diff {habit.difficulty}/5
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <Flame className="w-3.5 h-3.5 text-[#d9a441] fill-[#d9a441]" />
                  <span className="text-[#d9a441]">Active</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════ SCENE 02: TASKS & SIGNALS ════════════════════ */}
      <section id="s-tasks" className="min-h-screen py-24 px-6 sm:px-12 md:px-20 border-b border-[#262822]/60 relative flex items-center">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#7a7568]">
              02 · Closing The Loops
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#cfc8ba] leading-tight text-halo">
              Daily tasks,<br />
              streamed and solved.
            </h2>
            <p className="text-sm sm:text-base text-[#b5afa2] leading-relaxed">
              High priority tasks are execution bottlenecks. Capture them instantly, assign priorities, and check them off cleanly so your mental workspace remains uncluttered.
            </p>
            <div className="p-4 border border-dashed border-[#33352f] font-mono text-xs text-[#7a7568] space-y-1">
              <div>ACTIVE PIPELINE: <span className="text-[#cfc8ba]">{localTasks.filter(t => !t.completed).length} open loops</span></div>
              <div>COMPLETED TODAY: <span className="text-[#8fb896]">{localTasks.filter(t => t.completed).length} items resolved</span></div>
            </div>
          </div>

          {/* Interactive Task Stream */}
          <div className="space-y-3">
            {localTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-4 rounded border transition-all cursor-pointer flex items-center justify-between ${
                  task.completed
                    ? 'bg-[#101412] border-[#1d2b20] opacity-60'
                    : 'bg-[#121518] border-[#2b2e2b] hover:border-[#7a7568]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    task.completed
                      ? 'bg-[#8fb896] border-[#8fb896] text-[#0e1113]'
                      : 'border-[#4a4d46]'
                  }`}>
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-medium ${task.completed ? 'line-through text-[#7a7568]' : 'text-[#cfc8ba]'}`}>
                      {task.title}
                    </p>
                    <p className="text-[11px] text-[#7a7568] truncate max-w-xs">
                      Due: {task.dueDate === '2026-08-26' ? 'Today' : task.dueDate} • {task.category}
                    </p>
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
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════ SCENE 03: REFLECTION & ENERGY ════════════════════ */}
      <section id="s-journal" className="min-h-screen py-24 px-6 sm:px-12 md:px-20 border-b border-[#262822]/60 relative flex items-center">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#d9a441]">
              03 · The Daily Reflection
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#cfc8ba] leading-tight text-halo">
              The anatomy of<br />
              an honest day.
            </h2>
            <p className="text-sm sm:text-base text-[#b5afa2] leading-relaxed">
              Productivity without self-awareness is just exhaustion. Capture your mood rating, observe your energy level, and write down raw takeaways so you can identify patterns over weeks and months.
            </p>
            <div className="font-mono text-xs text-[#7a7568] space-y-2">
              <div className="flex items-center justify-between border-b border-[#262822] pb-1">
                <span>MOOD LEVEL</span>
                <span className="text-[#d9a441] font-bold">{journalMood} / 5</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#262822] pb-1">
                <span>ENERGY SCORE</span>
                <span className="text-[#8fb896] font-bold">{journalEnergy} / 10</span>
              </div>
            </div>
          </div>

          {/* Interactive Journal Box */}
          <div className="p-6 rounded border border-[#2b2e2b] bg-[#121518] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-[#7a7568]">
                Notebook · Aug 26, 2026
              </span>
              {savedJournal && (
                <span className="font-mono text-xs text-[#8fb896] flex items-center gap-1">
                  ✓ Saved to Database
                </span>
              )}
            </div>

            {/* Mood selector */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#7a7568]">Mood:</span>
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  onClick={() => setJournalMood(m)}
                  className={`w-8 h-8 rounded text-sm transition-all ${
                    journalMood === m
                      ? 'bg-[#d9a441] text-[#12140f] font-bold'
                      : 'border border-[#33352f] text-[#7a7568] hover:border-[#7a7568]'
                  }`}
                >
                  {m === 1 ? '😫' : m === 2 ? '😔' : m === 3 ? '😐' : m === 4 ? '🙂' : '😄'}
                </button>
              ))}
            </div>

            {/* Energy Slider */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-xs text-[#7a7568]">
                <span>Energy: {journalEnergy}/10</span>
                <span>{journalEnergy >= 8 ? 'High Flow' : journalEnergy >= 5 ? 'Steady' : 'Depleted'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={journalEnergy}
                onChange={(e) => setJournalEnergy(Number(e.target.value))}
                className="w-full accent-[#8fb896] h-1.5 bg-[#262822] rounded cursor-pointer"
              />
            </div>

            <textarea
              rows="4"
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="What worked? What challenged you today?"
              className="w-full p-3 rounded bg-[#0e1113] border border-[#262822] text-xs text-[#cfc8ba] focus:outline-none focus:border-[#d9a441] leading-relaxed resize-none font-mono"
            />

            <button
              onClick={handleSaveJournal}
              className="btn-story moss w-full justify-center"
            >
              <span>Save Daily Reflection</span>
            </button>
          </div>

        </div>
      </section>

      {/* ════════════════════ SCENE 04: THE SCORING FORMULA ════════════════════ */}
      <section id="s-score" className="min-h-screen py-24 px-6 sm:px-12 md:px-20 border-b border-[#262822]/60 relative flex items-center">
        <div className="max-w-6xl w-full mx-auto space-y-12">
          
          <div className="max-w-2xl space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#d9a441]">
              04 · The Scoring Engine
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#cfc8ba] leading-tight text-halo">
              A transparent formula,<br />
              not a black box.
            </h2>
            <p className="text-sm sm:text-base text-[#b5afa2] leading-relaxed">
              Your monthly score isn't an arbitrary vanity metric. It calculates four distinct dimensions of discipline so you know exactly where you gained or lost ground.
            </p>
          </div>

          {/* Interactive Formula Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            <div className="lg:col-span-2 space-y-5 p-6 rounded border border-[#2b2e2b] bg-[#121518]">
              <div className="font-mono text-xs text-[#7a7568] uppercase tracking-widest border-b border-[#262822] pb-2">
                Live Formula Simulator
              </div>

              {/* Consistency 50% */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#cfc8ba]">Consistency (50% weight)</span>
                  <span className="text-[#d9a441]">{simConsistency}% → {Math.round(simConsistency * 0.5)} pts</span>
                </div>
                <input
                  type="range" min="0" max="100" value={simConsistency}
                  onChange={(e) => setSimConsistency(Number(e.target.value))}
                  className="w-full accent-[#d9a441] h-1.5 bg-[#262822] rounded cursor-pointer"
                />
              </div>

              {/* Difficulty 20% */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#cfc8ba]">Difficulty (20% weight)</span>
                  <span className="text-[#d9a441]">{simDifficulty}% → {Math.round(simDifficulty * 0.2)} pts</span>
                </div>
                <input
                  type="range" min="0" max="100" value={simDifficulty}
                  onChange={(e) => setSimDifficulty(Number(e.target.value))}
                  className="w-full accent-[#d9a441] h-1.5 bg-[#262822] rounded cursor-pointer"
                />
              </div>

              {/* Streak 15% */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#cfc8ba]">Streak Length (15% weight)</span>
                  <span className="text-[#8fb896]">{simStreak}% → {Math.round(simStreak * 0.15)} pts</span>
                </div>
                <input
                  type="range" min="0" max="100" value={simStreak}
                  onChange={(e) => setSimStreak(Number(e.target.value))}
                  className="w-full accent-[#8fb896] h-1.5 bg-[#262822] rounded cursor-pointer"
                />
              </div>

              {/* Improvement 15% */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#cfc8ba]">Month-over-Month Growth (15% weight)</span>
                  <span className="text-[#8fb896]">{simImprovement}% → {Math.round(simImprovement * 0.15)} pts</span>
                </div>
                <input
                  type="range" min="0" max="100" value={simImprovement}
                  onChange={(e) => setSimImprovement(Number(e.target.value))}
                  className="w-full accent-[#8fb896] h-1.5 bg-[#262822] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Score Output Card */}
            <div className="p-8 rounded border border-[#d9a441]/50 bg-[#15130b] flex flex-col items-center justify-center text-center space-y-4">
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#d9a441]">
                Calculated Score
              </span>
              <div className="text-6xl sm:text-7xl font-extrabold text-[#cfc8ba] font-mono tracking-tighter">
                {simScore}
              </div>
              <span className={`font-mono text-xs uppercase px-3 py-1 rounded border ${
                simScore >= 91 ? 'border-[#8fb896] text-[#8fb896]' : simScore >= 76 ? 'border-[#d9a441] text-[#d9a441]' : 'border-[#7a7568] text-[#7a7568]'
              }`}>
                {simScore >= 91 ? 'Elite Level 🔥' : simScore >= 76 ? 'Excellent Level' : 'Good Level'}
              </span>
              <p className="text-[11px] text-[#7a7568] max-w-xs">
                {simScore >= 90 ? 'Unlocks Premium Noise-Cancelling Milestone reward!' : 'Maintain consistency to unlock high tier rewards.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════ SCENE 05: THE RECEIPT & CTA ════════════════════ */}
      <section id="s-receipt" className="min-h-screen py-24 px-6 sm:px-12 md:px-20 relative flex items-center">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#8fb896]">
              05 · The Daily Summary
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#cfc8ba] leading-tight text-halo">
              Where your effort<br />
              stands today.
            </h2>
            <p className="text-sm sm:text-base text-[#b5afa2] leading-relaxed">
              Every day logged is permanently preserved in historical records. You can explore month-by-month calendars, historical Recharts analytics, custom personal rewards, and task filters in the full workspace.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenWorkspace}
                className="btn-story accent text-sm px-6 py-3.5"
              >
                <span>Launch Interactive Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Consider Digital Style Receipt Component */}
          <div className="receipt" aria-label="Productivity Telemetry Receipt">
            <h4 className="font-mono text-xs tracking-[0.24em] text-[#cfc8ba] uppercase border-b border-[#33352f] pb-2 mb-3">
              Daily System Telemetry — The Receipt
            </h4>
            
            <div className="r-row">
              <span>Date</span>
              <span className="dots"></span>
              <span className="v">2026-08-26</span>
            </div>
            <div className="r-row">
              <span>Active Habits</span>
              <span className="dots"></span>
              <span className="v">4 configured</span>
            </div>
            <div className="r-row">
              <span>Habits Completed Today</span>
              <span className="dots"></span>
              <span className="v">{localHabits.filter(h => h.completed).length} / {localHabits.length}</span>
            </div>
            <div className="r-row">
              <span>Tasks Resolved</span>
              <span className="dots"></span>
              <span className="v">{localTasks.filter(t => t.completed).length} / {localTasks.length}</span>
            </div>
            <div className="r-row">
              <span>Current Longest Streak</span>
              <span className="dots"></span>
              <span className="v">29 days 🔥</span>
            </div>
            <div className="r-row">
              <span>August Consistency Rate</span>
              <span className="dots"></span>
              <span className="v">95% (vs July 75%)</span>
            </div>
            <div className="r-row">
              <span>Daily Reflection</span>
              <span className="dots"></span>
              <span className="v">Logged (Mood {journalMood}/5, Energy {journalEnergy}/10)</span>
            </div>

            <div className="r-row total">
              <span>Monthly Composite Score</span>
              <span className="dots"></span>
              <span className="v text-[#8fb896] font-bold">92 / 100 [ELITE]</span>
            </div>
            <div className="r-row total" style={{ border: 'none', marginTop: '0.3rem', paddingTop: 0 }}>
              <span>Target Milestone</span>
              <span className="dots"></span>
              <span className="v text-[#d9a441]">🎉 Unlocked (90+ Pts)</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
