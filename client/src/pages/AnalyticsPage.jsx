import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';
import { api } from '../api';
import { getCurrentMonth, formatMonthTitle } from '../utils/date';

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: '#0e1113',
    borderColor: '#2b2e2b',
    borderRadius: '4px',
    color: '#cfc8ba',
    fontSize: '11px',
    fontFamily: 'monospace'
  },
  labelStyle: { color: '#7a7568' }
};

export function AnalyticsPage() {
  const [scoreData, setScoreData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [scoreRes, analyticsRes] = await Promise.all([
        api.getMonthlyScore(getCurrentMonth()),
        api.getAnalyticsOverview()
      ]);
      setScoreData(scoreRes);
      setAnalyticsData(analyticsRes);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to load performance telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] font-mono text-xs text-[#7a7568]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#d9a441] border-t-transparent rounded-full animate-spin"></div>
          <p>Loading analytics telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] font-mono text-xs space-y-4">
        <p className="text-[#e06c58]">{error || 'Unable to retrieve telemetry payload.'}</p>
        <button
          onClick={loadAnalytics}
          className="px-3 py-1.5 rounded bg-[#1b1f23] hover:bg-[#262822] text-[#d9a441] border border-[#2b2e2b] transition-colors"
        >
          Retry Telemetry
        </button>
      </div>
    );
  }

  const breakdown = scoreData.breakdown || {};
  const diffPct = breakdown.improvement?.diffPercentage ?? 0;

  const scoreBreakdown = [
    {
      label: 'Consistency',
      pct: '50%',
      pts: breakdown.consistency?.weighted ?? 0,
      max: 50,
      raw: `${breakdown.consistency?.rawPercentage ?? breakdown.consistency?.score ?? 0}% habit completion`
    },
    {
      label: 'Difficulty',
      pct: '20%',
      pts: breakdown.difficulty?.weighted ?? 0,
      max: 20,
      raw: `${breakdown.difficulty?.avgDifficulty ?? 0}/5 difficulty load`
    },
    {
      label: 'Streaks',
      pct: '15%',
      pts: breakdown.streak?.weighted ?? 0,
      max: 15,
      raw: `${breakdown.streak?.maxStreak ?? 0} day max streak`
    },
    {
      label: 'Improvement',
      pct: '15%',
      pts: breakdown.improvement?.weighted ?? 0,
      max: 15,
      raw: `${diffPct >= 0 ? '+' : ''}${diffPct}% vs prev month`,
      accent: diffPct > 0
    },
  ];

  const levelColor = {
    'Elite': '#8fb896',
    'Excellent': '#8fb896',
    'Good': '#d9a441',
    'Unstoppable': '#8fb896',
    'High Performer': '#d9a441',
    'Consistent': '#cfc8ba',
    'Building Momentum': '#b5afa2',
    'Getting Started': '#7a7568',
    'Needs Work': '#e06c58'
  }[scoreData.level] || '#cfc8ba';

  const currentMonthLabel = formatMonthTitle(scoreData?.month || getCurrentMonth());

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#cfc8ba] uppercase font-mono tracking-wider">
          05 · Performance Telemetry
        </h2>
        <p className="text-xs text-[#7a7568]">
          Transparent metrics communicating actionable insights, not empty charts.
        </p>
      </div>

      {/* Score Hero */}
      <div className="consider-card p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

          <div className="space-y-3">
            <div className="flex items-center gap-3 font-mono">
              <span className="text-[10px] uppercase tracking-wider text-[#7a7568]">
                {currentMonthLabel} · Monthly Score
              </span>
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border"
                style={{ color: levelColor, borderColor: levelColor + '55', backgroundColor: levelColor + '11' }}
              >
                {scoreData.level}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-extrabold font-mono" style={{ color: levelColor }}>
                {scoreData.score}
              </span>
              <span className="text-lg text-[#4a4d46] font-mono">/ 100</span>
            </div>

            {/* Score bar */}
            <div className="w-64 h-1.5 bg-[#1b1f23] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${scoreData.score}%`, backgroundColor: levelColor }}
              />
            </div>
          </div>

          {/* 4-part breakdown */}
          <div className="grid grid-cols-2 gap-3 font-mono min-w-[300px]">
            {scoreBreakdown.map((item) => (
              <div key={item.label} className="p-3 rounded bg-[#0e1113] border border-[#262822] space-y-1">
                <p className="text-[9px] text-[#7a7568] uppercase tracking-wider">
                  {item.label} ({item.pct})
                </p>
                <p className={`text-sm font-bold ${item.accent ? 'text-[#8fb896]' : 'text-[#cfc8ba]'}`}>
                  {item.pts} / {item.max} pts
                </p>
                <p className={`text-[10px] ${item.accent ? 'text-[#8fb896]' : 'text-[#7a7568]'}`}>
                  {item.raw}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Daily Consistency Trend */}
        <div className="consider-card p-5">
          <div className="mb-4">
            <h3 className="font-bold text-xs text-[#cfc8ba] uppercase font-mono tracking-wider">
              Daily Completion Trend
            </h3>
            <p className="text-[10px] text-[#7a7568] font-mono mt-0.5">
              % of active habits completed · {currentMonthLabel}
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262822" opacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#7a7568', fontFamily: 'monospace' }} stroke="#262822" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#7a7568', fontFamily: 'monospace' }} stroke="#262822" />
                <Tooltip {...chartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  name="Completion %"
                  stroke="#d9a441"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#d9a441' }}
                  activeDot={{ r: 4, fill: '#d9a441' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekday Performance */}
        <div className="consider-card p-5">
          <div className="mb-4">
            <h3 className="font-bold text-xs text-[#cfc8ba] uppercase font-mono tracking-wider">
              Weekday Performance
            </h3>
            <p className="text-[10px] text-[#7a7568] font-mono mt-0.5">
              Which days are your habits strongest?
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.weekdayPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262822" opacity={0.6} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#7a7568', fontFamily: 'monospace' }} stroke="#262822" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#7a7568', fontFamily: 'monospace' }} stroke="#262822" />
                <Tooltip {...chartTooltipStyle} />
                <Bar
                  dataKey="rate"
                  name="Consistency %"
                  fill="#8fb896"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Month-over-Month Comparison Table */}
      <div className="consider-card p-5">
        <div className="mb-4">
          <h3 className="font-bold text-xs text-[#cfc8ba] uppercase font-mono tracking-wider">
            Month-over-Month Comparison
          </h3>
          <p className="text-[10px] text-[#7a7568] font-mono mt-0.5">
            Previous month vs {currentMonthLabel} habit consistency
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b border-[#262822] text-[10px] text-[#7a7568] uppercase tracking-wider">
                <th className="pb-3 pr-4">Habit</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Diff</th>
                <th className="pb-3 pr-4">Prev Month</th>
                <th className="pb-3 pr-4">This Month</th>
                <th className="pb-3 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#1b1f23]">
              {analyticsData?.habitComparison && analyticsData.habitComparison.length > 0 ? (
                analyticsData.habitComparison.map((item) => (
                  <tr
                    key={item.habitId}
                    className="hover:bg-[#121518] transition-colors"
                  >
                    <td className="py-2.5 pr-4 font-semibold text-[#cfc8ba]">
                      {item.name}
                    </td>
                    <td className="py-2.5 pr-4 text-[#7a7568]">
                      {item.category}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="px-1.5 py-0.5 rounded bg-[#1b1f23] text-[#7a7568] text-[10px]">
                        {item.difficulty}/5
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[#b5afa2]">{item.prevRate ?? 0}%</td>
                    <td className="py-2.5 pr-4 text-[#cfc8ba] font-bold">{item.currRate ?? 0}%</td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-flex items-center gap-0.5 font-bold ${
                        (item.diff ?? 0) >= 0 ? 'text-[#8fb896]' : 'text-[#e06c58]'
                      }`}>
                        {(item.diff ?? 0) >= 0 ? (
                          <><ArrowUpRight className="w-3 h-3" />+{(item.diff ?? 0)}%</>
                        ) : (
                          <><ArrowDownRight className="w-3 h-3" />{(item.diff ?? 0)}%</>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#7a7568] text-xs">
                    No habit comparison data available for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
