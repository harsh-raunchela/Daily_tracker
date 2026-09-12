import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateMonthlyScore } from './scoring.js';

const router = express.Router();

const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

router.get('/overview', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStr = month.toString().padStart(2, '0');
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthStr = prevMonth.toString().padStart(2, '0');

  const daysInCurrentMonth = now.getDate();
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const habits = db.find('habits', h => h.userId === userId && h.active !== false);
  const records = db.find('habitRecords', r => r.userId === userId);

  // 1. Daily trend for current month
  const dailyTrend = [];
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dayStr = d.toString().padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    const dayRecords = records.filter(r => r.date === dateKey && r.completed);
    const rate = habits.length > 0 ? Math.round((dayRecords.length / habits.length) * 100) : 0;
    dailyTrend.push({
      date: `Day ${d}`,
      fullDate: dateKey,
      completionRate: rate,
      completedCount: dayRecords.length
    });
  }

  // 2. Weekday Performance
  const weekdayTotals = { Mon: { total: 0, completed: 0 }, Tue: { total: 0, completed: 0 }, Wed: { total: 0, completed: 0 }, Thu: { total: 0, completed: 0 }, Fri: { total: 0, completed: 0 }, Sat: { total: 0, completed: 0 }, Sun: { total: 0, completed: 0 } };
  const weekdayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  records.filter(r => r.date.startsWith(`${year}-${monthStr}`)).forEach(r => {
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

  // 3. Habit-by-habit previous vs current month comparison
  const habitComparison = habits.map(h => {
    const prevRecords = records.filter(r => r.habitId === h.id && r.date.startsWith(`${prevYear}-${prevMonthStr}`) && r.completed);
    const currRecords = records.filter(r => r.habitId === h.id && r.date.startsWith(`${year}-${monthStr}`) && r.completed);
    
    const prevRate = Math.round((prevRecords.length / daysInPrevMonth) * 100);
    const currRate = Math.round((currRecords.length / daysInCurrentMonth) * 100);
    const trend = currRate >= prevRate ? 'up' : 'down';
    const diff = currRate - prevRate;

    return {
      habitId: h.id,
      name: h.name,
      category: h.category,
      difficulty: h.difficulty,
      prevRate,
      currRate,
      diff,
      trend
    };
  });

  // 4. Mood & Energy Correlation
  const journals = db.find('journalEntries', j => j.userId === userId && j.date.startsWith(`${year}-${monthStr}`));
  const moodEnergyTrend = journals.map(j => ({
    date: j.date.substring(5),
    mood: j.mood,
    energy: j.energy
  })).sort((a, b) => a.date.localeCompare(b.date));

  // 5. Monthly Scores
  const currentScore = calculateMonthlyScore(userId, `${year}-${monthStr}`);
  const previousScore = calculateMonthlyScore(userId, `${prevYear}-${prevMonthStr}`);

  res.json({
    dailyTrend,
    weekdayPerformance,
    habitComparison,
    moodEnergyTrend,
    monthlyScores: [
      { month: `${prevMonth}/${prevYear}`, ...previousScore },
      { month: `${month}/${year}`, ...currentScore }
    ]
  });
});

export default router;
