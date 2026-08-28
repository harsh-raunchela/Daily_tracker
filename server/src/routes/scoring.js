import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

export function calculateMonthlyScore(userId, month = '2026-08') {
  const habits = db.find('habits', h => h.userId === userId && h.active !== false);
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  // Determine elapsed days in month (up to 26 if current month is August 2026)
  const isCurrentMonth = month === '2026-08';
  const elapsedDays = isCurrentMonth ? 26 : daysInMonth;

  if (habits.length === 0 || elapsedDays === 0) {
    return {
      month,
      score: 0,
      level: 'Getting Started',
      breakdown: {
        consistency: { score: 0, weight: 0.50, weighted: 0, rawPercentage: 0 },
        difficulty: { score: 0, weight: 0.20, weighted: 0, avgDifficulty: 0 },
        streak: { score: 0, weight: 0.15, weighted: 0, avgStreak: 0 },
        improvement: { score: 0, weight: 0.15, weighted: 0, diffPercentage: 0 }
      }
    };
  }

  // 1. Consistency (50%): Completed habit events / total expected habit events in elapsed days
  const records = db.find('habitRecords', r => r.userId === userId && r.date.startsWith(month) && r.completed);
  const totalExpected = habits.length * elapsedDays;
  const totalCompleted = records.length;
  const consistencyRate = Math.min(100, Math.round((totalCompleted / Math.max(1, totalExpected)) * 100));
  const consistencyScore = consistencyRate; // 0 - 100

  // 2. Difficulty (20%): Average difficulty of active habits normalized to 100 (difficulty is 1-5, so 5 = 100%)
  const avgDifficultyRaw = habits.reduce((acc, h) => acc + (h.difficulty || 3), 0) / habits.length;
  const difficultyScore = Math.round((avgDifficultyRaw / 5) * 100);

  // 3. Streak (15%): Max active streak achieved across habits (capped at 100 for 30 days)
  let maxStreak = 0;
  habits.forEach(habit => {
    const habitRecords = records.filter(r => r.habitId === habit.id);
    maxStreak = Math.max(maxStreak, habitRecords.length);
  });
  const streakScore = Math.min(100, Math.round((maxStreak / Math.min(30, elapsedDays)) * 100));

  // 4. Improvement over previous month (15%):
  // Calculate previous month
  const prevMonthDate = new Date(year, monthNum - 2, 1);
  const prevYearStr = prevMonthDate.getFullYear();
  const prevMonthNumStr = (prevMonthDate.getMonth() + 1).toString().padStart(2, '0');
  const prevMonth = `${prevYearStr}-${prevMonthNumStr}`;

  const prevRecords = db.find('habitRecords', r => r.userId === userId && r.date.startsWith(prevMonth) && r.completed);
  const prevDays = new Date(prevYearStr, prevMonthDate.getMonth() + 1, 0).getDate();
  const prevExpected = habits.length * prevDays;
  const prevConsistency = prevExpected > 0 ? (prevRecords.length / prevExpected) * 100 : consistencyRate;

  let improvementScore = 70; // baseline if no change
  const diff = consistencyRate - prevConsistency;
  if (diff >= 10) improvementScore = 100;
  else if (diff >= 5) improvementScore = 90;
  else if (diff >= 0) improvementScore = 80;
  else if (diff >= -5) improvementScore = 65;
  else improvementScore = 50;

  // Composite Weighted Score
  const weightedConsistency = consistencyScore * 0.50;
  const weightedDifficulty = difficultyScore * 0.20;
  const weightedStreak = streakScore * 0.15;
  const weightedImprovement = improvementScore * 0.15;

  const totalScore = Math.min(100, Math.round(weightedConsistency + weightedDifficulty + weightedStreak + weightedImprovement));

  // Level Assignment
  let level = 'Needs Work';
  if (totalScore >= 91) level = 'Elite';
  else if (totalScore >= 76) level = 'Excellent';
  else if (totalScore >= 61) level = 'Good';
  else if (totalScore >= 41) level = 'Getting Started';

  return {
    month,
    score: totalScore,
    level,
    breakdown: {
      consistency: {
        score: consistencyScore,
        weight: 0.50,
        weighted: Math.round(weightedConsistency),
        rawPercentage: consistencyRate,
        completed: totalCompleted,
        expected: totalExpected
      },
      difficulty: {
        score: difficultyScore,
        weight: 0.20,
        weighted: Math.round(weightedDifficulty),
        avgDifficulty: Number(avgDifficultyRaw.toFixed(1))
      },
      streak: {
        score: streakScore,
        weight: 0.15,
        weighted: Math.round(weightedStreak),
        maxStreak
      },
      improvement: {
        score: improvementScore,
        weight: 0.15,
        weighted: Math.round(weightedImprovement),
        diffPercentage: Math.round(diff),
        prevMonthConsistency: Math.round(prevConsistency)
      }
    }
  };
}

// GET monthly score with transparent formula breakdown
router.get('/monthly', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const month = req.query.month || '2026-08';

  const scoreData = calculateMonthlyScore(userId, month);
  res.json(scoreData);
});

// GET historical scores for past months
router.get('/history', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const months = ['2026-05', '2026-06', '2026-07', '2026-08'];

  const history = months.map(m => calculateMonthlyScore(userId, m));
  res.json(history);
});

export default router;
