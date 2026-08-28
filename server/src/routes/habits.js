import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper: calculate streaks from sorted date array
function calculateStreaksFromDates(dates) {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0, totalCompleted: 0 };
  const sortedDates = [...new Set(dates)].sort();
  const totalCompleted = sortedDates.length;

  let longestStreak = 0, tempStreak = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak += 1;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }

  const todayStr = '2026-08-26';
  const dateSet = new Set(sortedDates);
  let checkDate = new Date(todayStr);
  const fmt = (d) => d.toISOString().split('T')[0];
  let streakCount = 0;

  if (dateSet.has(fmt(checkDate))) {
    streakCount++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    const yesterday = new Date(checkDate);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateSet.has(fmt(yesterday))) {
      checkDate = yesterday;
    }
  }

  while (dateSet.has(fmt(checkDate))) {
    streakCount++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { currentStreak: streakCount, longestStreak, totalCompleted };
}

// GET all habits for today
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = req.query.date || '2026-08-26';

    const habits = db.find('habits', h => h.userId === userId && h.active !== false);
    const todayRecords = db.find('habitRecords', r => r.userId === userId && r.date === todayStr);
    const allCompleted = db.find('habitRecords', r => r.userId === userId && r.completed);

    const habitsWithStats = habits.map(habit => {
      const todayRecord = todayRecords.find(r => r.habitId === habit.id);
      const habitDates = allCompleted.filter(r => r.habitId === habit.id).map(r => r.date);
      const { currentStreak, longestStreak, totalCompleted } = calculateStreaksFromDates(habitDates);
      return {
        ...habit,
        todayCompleted: todayRecord ? todayRecord.completed : false,
        todayValue: todayRecord ? Number(todayRecord.value) : 0,
        todayNote: todayRecord ? todayRecord.note : '',
        currentStreak,
        longestStreak,
        totalCompleted
      };
    });

    res.json(habitsWithStats);
  } catch (err) {
    console.error('Get habits error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create habit
router.post('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, category, target, unit, difficulty, frequency, color, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Habit name is required' });

    const newHabit = {
      id: crypto.randomUUID(),
      userId,
      name,
      description: description || '',
      category: category || 'General',
      target: Number(target) || 1,
      unit: unit || 'times',
      difficulty: Math.min(5, Math.max(1, Number(difficulty) || 3)),
      frequency: frequency || 'daily',
      active: true,
      color: color || '#d9a441',
      createdAt: new Date().toISOString()
    };

    db.insert('habits', newHabit);
    res.status(201).json(newHabit);
  } catch (err) {
    console.error('Create habit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update habit
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const { name, category, target, unit, difficulty, frequency, color, description, active } = req.body;

    const existing = db.findOne('habits', h => h.id === habitId && h.userId === userId);
    if (!existing) return res.status(404).json({ message: 'Habit not found' });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (target !== undefined) updates.target = Number(target);
    if (unit !== undefined) updates.unit = unit;
    if (difficulty !== undefined) updates.difficulty = Math.min(5, Math.max(1, Number(difficulty)));
    if (frequency !== undefined) updates.frequency = frequency;
    if (color !== undefined) updates.color = color;
    if (description !== undefined) updates.description = description;
    if (active !== undefined) updates.active = active;

    const updated = db.update('habits', h => h.id === habitId && h.userId === userId, updates);
    res.json(updated);
  } catch (err) {
    console.error('Update habit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE habit
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const deleted = db.delete('habits', h => h.id === habitId && h.userId === userId);
    if (!deleted) return res.status(404).json({ message: 'Habit not found' });

    // Also remove habit records
    db.deleteMany('habitRecords', r => r.habitId === habitId && r.userId === userId);
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST toggle completion for a specific date
router.post('/:id/completion', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const { date, completed, value, note } = req.body;
    const targetDate = date || '2026-08-26';

    const habit = db.findOne('habits', h => h.id === habitId && h.userId === userId);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const existing = db.findOne('habitRecords', r => r.habitId === habitId && r.userId === userId && r.date === targetDate);

    if (existing) {
      const isCompleted = completed !== undefined ? completed : !existing.completed;
      const recordValue = value !== undefined ? Number(value) : (isCompleted ? Number(habit.target) : 0);
      const updated = db.update(
        'habitRecords',
        r => r.id === existing.id,
        {
          completed: isCompleted,
          value: recordValue,
          note: note !== undefined ? note : existing.note,
          updatedAt: new Date().toISOString()
        }
      );
      return res.json(updated);
    } else {
      const isCompleted = completed !== undefined ? completed : true;
      const recordValue = value !== undefined ? Number(value) : (isCompleted ? Number(habit.target) : 0);
      const newRecord = {
        id: crypto.randomUUID(),
        habitId,
        userId,
        date: targetDate,
        completed: isCompleted,
        value: recordValue,
        note: note || '',
        updatedAt: new Date().toISOString()
      };
      db.insert('habitRecords', newRecord);
      return res.status(201).json(newRecord);
    }
  } catch (err) {
    console.error('Toggle completion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET calendar matrix for a month
router.get('/calendar', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month || '2026-08';
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const habits = db.find('habits', h => h.userId === userId && h.active !== false);
    const records = db.find('habitRecords', r => r.userId === userId && r.date.startsWith(month));

    const calendarData = habits.map(habit => {
      const habitRecords = records.filter(r => r.habitId === habit.id);
      const days = {};
      for (let d = 1; d <= daysInMonth; d++) {
        const dayKey = d < 10 ? `0${d}` : `${d}`;
        const dateKey = `${month}-${dayKey}`;
        const rec = habitRecords.find(r => r.date === dateKey);
        days[dayKey] = {
          date: dateKey,
          completed: rec ? rec.completed : false,
          value: rec ? Number(rec.value) : 0
        };
      }
      const completedCount = Object.values(days).filter(d => d.completed).length;
      return {
        habit: {
          id: habit.id,
          name: habit.name,
          category: habit.category,
          difficulty: habit.difficulty,
          color: habit.color,
          target: habit.target,
          unit: habit.unit
        },
        days,
        completedCount,
        totalDays: daysInMonth,
        consistencyRate: Math.round((completedCount / daysInMonth) * 100)
      };
    });

    res.json({ month, daysInMonth, habits: calendarData });
  } catch (err) {
    console.error('Calendar error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET history for single habit
router.get('/:id/history', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;

    const habit = db.findOne('habits', h => h.id === habitId && h.userId === userId);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const records = db.find('habitRecords', r => r.habitId === habitId && r.userId === userId);
    records.sort((a, b) => a.date.localeCompare(b.date));

    const completedDates = records.filter(r => r.completed).map(r => r.date);
    const { currentStreak, longestStreak, totalCompleted } = calculateStreaksFromDates(completedDates);

    res.json({
      habit,
      records,
      currentStreak,
      longestStreak,
      totalCompleted
    });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
