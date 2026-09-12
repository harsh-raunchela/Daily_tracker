import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db.js';
import { getTodayDate, getCurrentMonth, getPrevMonth, getDaysInMonth } from './utils/date.js';

export function seedUserData(userId) {
  // Check if habits exist for user
  const existingHabits = db.find('habits', h => h.userId === userId);
  if (existingHabits.length > 0) {
    return;
  }

  const todayStr = getTodayDate();
  const currentMonth = getCurrentMonth();
  const prevMonth = getPrevMonth(currentMonth);
  const daysInPrev = getDaysInMonth(prevMonth);
  const [curY, curM, curD] = todayStr.split('-').map(Number);

  // Pre-seed 4 habits
  const habits = [
    {
      id: crypto.randomUUID(),
      userId,
      name: 'Morning Deep Reading',
      category: 'Learning',
      target: 30,
      unit: 'minutes',
      difficulty: 3,
      frequency: 'daily',
      active: true,
      color: '#4F46E5',
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      name: 'Full Body Workout',
      category: 'Health',
      target: 45,
      unit: 'minutes',
      difficulty: 4,
      frequency: 'daily',
      active: true,
      color: '#16A34A',
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      name: 'Core System Coding',
      category: 'Career',
      target: 90,
      unit: 'minutes',
      difficulty: 5,
      frequency: 'daily',
      active: true,
      color: '#0EA5E9',
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      name: 'Mindful Meditation',
      category: 'Mindset',
      target: 15,
      unit: 'minutes',
      difficulty: 2,
      frequency: 'daily',
      active: true,
      color: '#F59E0B',
      createdAt: new Date().toISOString()
    }
  ];

  habits.forEach(h => db.insert('habits', h));

  // Previous month records - roughly 70% completion
  for (let day = 1; day <= daysInPrev; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${prevMonth}-${dayStr}`;
    habits.forEach((habit, hIdx) => {
      const completed = (day + hIdx) % 4 !== 0;
      db.insert('habitRecords', {
        id: crypto.randomUUID(),
        habitId: habit.id,
        userId,
        date: dateStr,
        completed,
        value: completed ? habit.target : 0,
        note: completed ? 'Completed on time' : '',
        updatedAt: `${dateStr}T20:00:00Z`
      });
    });
  }

  // Current month records up to today
  for (let day = 1; day <= curD; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentMonth}-${dayStr}`;
    habits.forEach((habit, hIdx) => {
      let completed = true;
      if (day === 7 || day === 14 || day === 21) {
        if (hIdx === 1) completed = false;
      }
      if (day === curD) {
        completed = hIdx === 0 || hIdx === 3;
      }
      db.insert('habitRecords', {
        id: crypto.randomUUID(),
        habitId: habit.id,
        userId,
        date: dateStr,
        completed,
        value: completed ? habit.target : 0,
        note: completed ? 'Consistent effort today.' : '',
        updatedAt: `${dateStr}T19:00:00Z`
      });
    });
  }

  // Seed sample tasks
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = `${dayAfter.getFullYear()}-${String(dayAfter.getMonth() + 1).padStart(2, '0')}-${String(dayAfter.getDate()).padStart(2, '0')}`;

  const tasks = [
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Review System Architecture document',
      description: 'Go over core modules and data flow in detail.',
      dueDate: todayStr,
      priority: 'high',
      category: 'Work',
      completed: true,
      completedAt: new Date().toISOString(),
      recurring: 'none',
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Prepare Weekly Sprint Planning',
      description: 'Align task priorities and habit targets for the coming sprint.',
      dueDate: todayStr,
      priority: 'high',
      category: 'Work',
      completed: false,
      completedAt: null,
      recurring: 'weekly',
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Order new reading material on distributed systems',
      description: 'Select books recommended in community discussion.',
      dueDate: tomorrowStr,
      priority: 'medium',
      category: 'Personal',
      completed: false,
      completedAt: null,
      recurring: 'none',
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Grocery shopping & meal prep for high energy',
      description: 'Stock up on vegetables, clean protein, and fruits.',
      dueDate: dayAfterStr,
      priority: 'low',
      category: 'Health',
      completed: false,
      completedAt: null,
      recurring: 'weekly',
      createdAt: new Date().toISOString()
    }
  ];

  tasks.forEach(t => db.insert('tasks', t));

  // Seed sample journal entries
  const journals = [
    {
      id: crypto.randomUUID(),
      userId,
      date: yesterdayStr,
      title: 'Flow state in programming and steady momentum',
      body: 'Spent three solid hours building out the data pipeline today. Had minimal distractions in the morning. Getting the habit routines locked in is starting to feel second nature.',
      mood: 5,
      energy: 9,
      tags: ['coding', 'flow', 'reflection'],
      highlights: ['Finished data engine', 'Kept 12-day streak alive'],
      challenges: ['Felt a bit tired after lunch, took a 15m walk'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      date: todayStr,
      title: 'Clarity and steady progress across all fronts',
      body: 'Focused on making daily actions frictionless. Completed morning reading and meditation early. Feeling energized to finish strong.',
      mood: 4,
      energy: 8,
      tags: ['clarity', 'habits', 'growth'],
      highlights: ['Morning routine completed smoothly'],
      challenges: ['Need to prioritize evening wind-down'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  journals.forEach(j => db.insert('journalEntries', j));

  // Seed sample rewards
  const rewards = [
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Premium Noise-Cancelling Headphones',
      description: 'Treat myself to deep work focus gear when achieving elite monthly score.',
      requiredScore: 90,
      month: currentMonth,
      unlocked: false,
      claimed: false,
      claimedAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Weekend Nature Getaway & Dinner',
      description: 'Unwind and celebrate maintaining over 80+ consistency score.',
      requiredScore: 80,
      month: currentMonth,
      unlocked: true,
      claimed: false,
      claimedAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'New Hardcover Tech Book',
      description: 'Reward for hitting 70+ baseline monthly habit score.',
      requiredScore: 70,
      month: currentMonth,
      unlocked: true,
      claimed: true,
      claimedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  rewards.forEach(r => db.insert('rewards', r));
}
