import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db.js';

export function seedUserData(userId) {
  // Check if habits exist for user
  const existingHabits = db.find('habits', h => h.userId === userId);
  if (existingHabits.length > 0) {
    return;
  }

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
      createdAt: '2026-08-01T08:00:00Z'
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
      createdAt: '2026-08-01T08:00:00Z'
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
      createdAt: '2026-08-01T08:00:00Z'
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
      createdAt: '2026-08-01T08:00:00Z'
    }
  ];

  habits.forEach(h => db.insert('habits', h));

  // Seed historical habit records for August 2026 up to today (Aug 26)
  // And also some July 2026 records for month-to-month improvement calculations!
  const today = new Date('2026-08-26');
  
  // July records (Days 1 to 31) - roughly 70% completion
  for (let day = 1; day <= 31; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-07-${dayStr}`;
    habits.forEach((habit, hIdx) => {
      // simulate realistic pattern
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

  // August records (Days 1 to 26) - higher consistency (~85%)
  for (let day = 1; day <= 26; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-08-${dayStr}`;
    habits.forEach((habit, hIdx) => {
      let completed = true;
      if (day === 7 || day === 14 || day === 21) {
        // slight rest days
        if (hIdx === 1) completed = false; // missed workout
      }
      if (day === 26) {
        // today - complete reading & meditation, leave workout & coding ready to be checked off in demo!
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
  const tasks = [
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Review System Architecture document',
      description: 'Go over core modules and data flow in detail.',
      dueDate: '2026-08-26',
      priority: 'high',
      category: 'Work',
      completed: true,
      completedAt: '2026-08-26T14:30:00Z',
      recurring: 'none',
      createdAt: '2026-08-26T09:00:00Z'
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Prepare Weekly Sprint Planning',
      description: 'Align task priorities and habit targets for the coming sprint.',
      dueDate: '2026-08-26',
      priority: 'high',
      category: 'Work',
      completed: false,
      completedAt: null,
      recurring: 'weekly',
      createdAt: '2026-08-26T10:00:00Z'
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Order new reading material on distributed systems',
      description: 'Select books recommended in community discussion.',
      dueDate: '2026-08-27',
      priority: 'medium',
      category: 'Personal',
      completed: false,
      completedAt: null,
      recurring: 'none',
      createdAt: '2026-08-26T11:00:00Z'
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Grocery shopping & meal prep for high energy',
      description: 'Stock up on vegetables, clean protein, and fruits.',
      dueDate: '2026-08-28',
      priority: 'low',
      category: 'Health',
      completed: false,
      completedAt: null,
      recurring: 'weekly',
      createdAt: '2026-08-26T12:00:00Z'
    }
  ];

  tasks.forEach(t => db.insert('tasks', t));

  // Seed sample journal entries
  const journals = [
    {
      id: crypto.randomUUID(),
      userId,
      date: '2026-08-25',
      title: 'Flow state in programming and steady momentum',
      body: 'Spent three solid hours building out the data pipeline today. Had minimal distractions in the morning. Getting the habit routines locked in is starting to feel second nature.',
      mood: 5,
      energy: 9,
      tags: ['coding', 'flow', 'reflection'],
      highlights: ['Finished data engine', 'Kept 12-day streak alive'],
      challenges: ['Felt a bit tired after lunch, took a 15m walk'],
      createdAt: '2026-08-25T21:30:00Z',
      updatedAt: '2026-08-25T21:30:00Z'
    },
    {
      id: crypto.randomUUID(),
      userId,
      date: '2026-08-26',
      title: 'Clarity and steady progress across all fronts',
      body: 'Focused on making daily actions frictionless. Completed morning reading and meditation early. Feeling energized to finish strong.',
      mood: 4,
      energy: 8,
      tags: ['clarity', 'habits', 'growth'],
      highlights: ['Morning routine completed smoothly'],
      challenges: ['Need to prioritize evening wind-down'],
      createdAt: '2026-08-26T18:00:00Z',
      updatedAt: '2026-08-26T18:00:00Z'
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
      month: '2026-08',
      unlocked: false,
      claimed: false,
      claimedAt: null,
      createdAt: '2026-08-01T00:00:00Z'
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Weekend Nature Getaway & Dinner',
      description: 'Unwind and celebrate maintaining over 80+ consistency score.',
      requiredScore: 80,
      month: '2026-08',
      unlocked: true,
      claimed: false,
      claimedAt: null,
      createdAt: '2026-08-01T00:00:00Z'
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'New Hardcover Tech Book',
      description: 'Reward for hitting 70+ baseline monthly habit score.',
      requiredScore: 70,
      month: '2026-08',
      unlocked: true,
      claimed: true,
      claimedAt: '2026-08-20T12:00:00Z',
      createdAt: '2026-08-01T00:00:00Z'
    }
  ];

  rewards.forEach(r => db.insert('rewards', r));
}
