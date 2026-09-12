import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { getCurrentMonth, getElapsedDaysInMonth, getDaysInMonth } from '../utils/date.js';

const router = express.Router();

export function calculateMonthlyScore(userId, month = null) {
  const targetMonth = month || getCurrentMonth();
  const habits = db.find('habits', h => h.userId === userId && h.active !== false);
  const [yearStr, monthStr] = targetMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const daysInMonth = getDaysInMonth(targetMonth);

  // Determine elapsed days in month dynamically
  const elapsedDays = getElapsedDaysInMonth(targetMonth);

  if (habits.length === 0 || elapsedDays === 0) {
    return {
      month: targetMonth,
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
  const records = db.find('habitRecords', r => r.userId === userId && r.date.startsWith(targetMonth) && r.completed);
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
  const prevMonthDate = new Date(year, monthNum - 2, 1);
  const prevYearStr = prevMonthDate.getFullYear();
  const prevMonthNumStr = (prevMonthDate.getMonth() + 1).toString().padStart(2, '0');
  const prevMonth = `${prevYearStr}-${prevMonthNumStr}`;
  const prevDaysInMonth = getDaysInMonth(prevMonth);

  const prevRecords = db.find('habitRecords', r => r.userId === userId && r.date.startsWith(prevMonth) && r.completed);
  const prevExpected = habits.length * prevDaysInMonth;
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
    month: targetMonth,
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
  const month = req.query.month || getCurrentMonth();

  const scoreData = calculateMonthlyScore(userId, month);
  res.json(scoreData);
});

// GET historical scores for past months
router.get('/history', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const currentMonth = getCurrentMonth();
  const [currY, currM] = currentMonth.split('-').map(Number);
  
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currY, currM - 1 - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(mStr);
  }

  const history = months.map(m => calculateMonthlyScore(userId, m));
  res.json(history);
});

export default router;
