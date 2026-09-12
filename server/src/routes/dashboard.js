import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateMonthlyScore } from './scoring.js';
import { getTodayDate } from '../utils/date.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const todayStr = req.query.date || getTodayDate();
  const monthStr = todayStr.substring(0, 7);

  // 1. Habits for today
  const habits = db.find('habits', h => h.userId === userId && h.active !== false);
  const todayRecords = db.find('habitRecords', r => r.userId === userId && r.date === todayStr);

  const todayHabits = habits.map(h => {
    const rec = todayRecords.find(r => r.habitId === h.id);
    return {
      ...h,
      completed: rec ? rec.completed : false,
      value: rec ? rec.value : 0
    };
  });

  const habitsCompletedCount = todayHabits.filter(h => h.completed).length;
  const habitCompletionRate = habits.length > 0 ? Math.round((habitsCompletedCount / habits.length) * 100) : 0;

  // 2. Tasks for today
  const allTasks = db.find('tasks', t => t.userId === userId);
  const todayTasks = allTasks.filter(t => t.dueDate === todayStr || (!t.completed && t.dueDate <= todayStr));
  const tasksCompletedCount = todayTasks.filter(t => t.completed).length;

  // 3. Journal for today
  const todayJournal = db.findOne('journalEntries', j => j.userId === userId && j.date === todayStr) || null;

  // 4. Monthly Score
  const monthlyScore = calculateMonthlyScore(userId, monthStr);

  // 5. Active Streaks
  let totalActiveStreakDays = 0;
  habits.forEach(h => {
    const userHabitRecords = db.find('habitRecords', r => r.habitId === h.id && r.userId === userId && r.completed);
    totalActiveStreakDays += userHabitRecords.length;
  });

  // 6. Closest Active Reward
  const rewards = db.find('rewards', r => r.userId === userId && !r.claimed);
  rewards.sort((a, b) => a.requiredScore - b.requiredScore);
  const nextReward = rewards.find(r => r.requiredScore > monthlyScore.score) || rewards[0] || null;

  res.json({
    date: todayStr,
    month: monthStr,
    summary: {
      habitsTotal: habits.length,
      habitsCompleted: habitsCompletedCount,
      habitCompletionRate,
      tasksTotal: todayTasks.length,
      tasksCompleted: tasksCompletedCount,
      journalLogged: !!todayJournal,
      monthlyScore: monthlyScore.score,
      monthlyLevel: monthlyScore.level
    },
    todayHabits,
    todayTasks,
    todayJournal,
    monthlyScore,
    nextReward
  });
});

export default router;
