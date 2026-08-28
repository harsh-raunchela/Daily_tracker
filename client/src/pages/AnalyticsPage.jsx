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

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [scoreRes, analyticsRes] = await Promise.all([
        api.getMonthlyScore('2026-08'),
        api.getAnalytics()
      ]);
      setScoreData(scoreRes);
      setAnalyticsData(analyticsRes);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, []);

  if (loading || !scoreData || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="font-mono text-xs text-[#7a7568] animate-pulse">
          Loading telemetry…
        </div>
      </div>
    );
  }

  const { breakdown } = scoreData;

  const scoreBreakdown = [
    { label: 'CONSISTENCY', pct: '50%', pts: breakdown.consistency.weighted, max: 50, raw: `${breakdown.consistency.rawPercentage}% executed` },
    { label: 'DIFFICULTY',  pct: '20%', pts: breakdown.difficulty.weighted,  max: 20, raw: `Avg ${breakdown.difficulty.avgDifficulty}/5` },
    { label: 'STREAKS',     pct: '15%', pts: breakdown.streak.weighted,      max: 15, raw: `Max ${breakdown.streak.maxStreak}d` },
    { label: 'IMPROVEMENT', pct: '15%', pts: breakdown.improvement.weighted, max: 15, raw: `+${breakdown.improvement.diffPercentage}% vs July`, accent: true },
  ];

  const levelColor = {
    'Elite': '#d9a441',
    'Excellent': '#8fb896',
    'Good': '#cfc8ba',
    'Getting Started': '#7a7568',
    'Needs Work': '#e06c58',
  }[scoreData.level] || '#cfc8ba';

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
                August 2026 · Monthly Score
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
                {/* micro bar */}
                <div className="h-0.5 bg-[#1b1f23] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(item.pts / item.max) * 100}%`,
                      backgroundColor: item.accent ? '#8fb896' : '#d9a441'
                    }}
                  />
                </div>
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
              % of active habits completed · August
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.dailyTrend}>
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
              <BarChart data={analyticsData.weekdayPerformance}>
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
            July 2026 vs August 2026 habit consistency
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b border-[#262822] text-[10px] text-[#7a7568] uppercase tracking-wider">
                <th className="pb-3 pr-4">Habit</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Diff</th>
                <th className="pb-3 pr-4">July</th>
                <th className="pb-3 pr-4">August</th>
                <th className="pb-3 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#1b1f23]">
              {analyticsData.habitComparison.map((item) => (
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
                  <td className="py-2.5 pr-4 text-[#b5afa2]">{item.julyRate}%</td>
                  <td className="py-2.5 pr-4 text-[#cfc8ba] font-bold">{item.augRate}%</td>
                  <td className="py-2.5 text-right">
                    <span className={`inline-flex items-center gap-0.5 font-bold ${
                      item.diff >= 0 ? 'text-[#8fb896]' : 'text-[#e06c58]'
                    }`}>
                      {item.diff >= 0 ? (
                        <><ArrowUpRight className="w-3 h-3" />+{item.diff}%</>
                      ) : (
                        <><ArrowDownRight className="w-3 h-3" />{item.diff}%</>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
