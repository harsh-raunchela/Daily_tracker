import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateMonthlyScore } from './scoring.js';

const router = express.Router();

router.get('/overview', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const habits = db.find('habits', h => h.userId === userId && h.active !== false);
  const records = db.find('habitRecords', r => r.userId === userId);

  // 1. Daily trend for August 2026 (Days 1 to 26)
  const dailyTrend = [];
  for (let d = 1; d <= 26; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const dateKey = `2026-08-${dayStr}`;
    const dayRecords = records.filter(r => r.date === dateKey && r.completed);
    const rate = habits.length > 0 ? Math.round((dayRecords.length / habits.length) * 100) : 0;
    dailyTrend.push({
      date: `Aug ${d}`,
      fullDate: dateKey,
      completionRate: rate,
      completedCount: dayRecords.length
    });
  }

  // 2. Weekday Performance (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  const weekdayTotals = { Mon: { total: 0, completed: 0 }, Tue: { total: 0, completed: 0 }, Wed: { total: 0, completed: 0 }, Thu: { total: 0, completed: 0 }, Fri: { total: 0, completed: 0 }, Sat: { total: 0, completed: 0 }, Sun: { total: 0, completed: 0 } };
  const weekdayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  records.filter(r => r.date.startsWith('2026-08')).forEach(r => {
    const d = new Date(r.date);
    const dayName = weekdayKeys[d.getDay()];
    if (weekdayTotals[dayName]) {
      weekdayTotals[dayName].total++;
      if (r.completed) weekdayTotals[dayName].completed++;
    }
  });

  const weekdayPerformance = Object.keys(weekdayTotals).map(k => ({
    day: k,
    rate: weekdayTotals[k].total > 0 ? Math.round((weekdayTotals[k].completed / weekdayTotals[k].total) * 100) : 0
  }));

  // 3. Habit-by-habit July vs August comparison
  const habitComparison = habits.map(h => {
    const julyRecords = records.filter(r => r.habitId === h.id && r.date.startsWith('2026-07') && r.completed);
    const augRecords = records.filter(r => r.habitId === h.id && r.date.startsWith('2026-08') && r.completed);
    
    const julyRate = Math.round((julyRecords.length / 31) * 100);
    const augRate = Math.round((augRecords.length / 26) * 100);
    const trend = augRate >= julyRate ? 'up' : 'down';
    const diff = augRate - julyRate;

    return {
      habitId: h.id,
      name: h.name,
      category: h.category,
      difficulty: h.difficulty,
      julyRate,
      augRate,
      diff,
      trend
    };
  });

  // 4. Mood & Energy Correlation with Productivity from Journal
  const journals = db.find('journalEntries', j => j.userId === userId && j.date.startsWith('2026-08'));
  const moodEnergyTrend = journals.map(j => ({
    date: j.date.substring(5),
    mood: j.mood,
    energy: j.energy
  })).sort((a, b) => a.date.localeCompare(b.date));

  // 5. Monthly Scores Overview
  const augustScore = calculateMonthlyScore(userId, '2026-08');
  const julyScore = calculateMonthlyScore(userId, '2026-07');

  res.json({
    dailyTrend,
    weekdayPerformance,
    habitComparison,
    moodEnergyTrend,
    monthlyScores: [
      { month: 'July 2026', ...julyScore },
      { month: 'August 2026', ...augustScore }
    ]
  });
});

export default router;
