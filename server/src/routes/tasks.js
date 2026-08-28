import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET tasks with optional filters
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { filter, category, search, date } = req.query;
  const todayStr = date || '2026-08-26';

  let tasks = db.find('tasks', t => t.userId === userId);

  if (category && category !== 'all') {
    tasks = tasks.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s)));
  }

  if (filter === 'today') {
    tasks = tasks.filter(t => t.dueDate === todayStr || (!t.completed && t.dueDate < todayStr));
  } else if (filter === 'upcoming') {
    tasks = tasks.filter(t => t.dueDate > todayStr && !t.completed);
  } else if (filter === 'completed') {
    tasks = tasks.filter(t => t.completed);
  } else if (filter === 'overdue') {
    tasks = tasks.filter(t => !t.completed && t.dueDate < todayStr);
  }

  // Sort: incomplete first, then by priority (high > medium > low), then due date
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pA = priorityWeight[a.priority] || 1;
    const pB = priorityWeight[b.priority] || 1;
    if (pA !== pB) return pB - pA;
    return (a.dueDate || '').localeCompare(b.dueDate || '');
  });

  res.json(tasks);
});

// POST create task
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { title, description, dueDate, priority, category, recurring } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  const newTask = {
    id: crypto.randomUUID(),
    userId,
    title,
    description: description || '',
    dueDate: dueDate || '2026-08-26',
    priority: priority || 'medium',
    category: category || 'Work',
    completed: false,
    completedAt: null,
    recurring: recurring || 'none',
    createdAt: new Date().toISOString()
  };

  db.insert('tasks', newTask);
  res.status(201).json(newTask);
});

// PUT update task
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  const { title, description, dueDate, priority, category, recurring, completed } = req.body;

  const existing = db.findOne('tasks', t => t.id === taskId && t.userId === userId);
  if (!existing) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (dueDate !== undefined) updates.dueDate = dueDate;
  if (priority !== undefined) updates.priority = priority;
  if (category !== undefined) updates.category = category;
  if (recurring !== undefined) updates.recurring = recurring;
  if (completed !== undefined) {
    updates.completed = completed;
    updates.completedAt = completed ? new Date().toISOString() : null;
  }

  const updated = db.update('tasks', t => t.id === taskId && t.userId === userId, updates);
  res.json(updated);
});

// PATCH toggle completion
router.patch('/:id/toggle', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  const existing = db.findOne('tasks', t => t.id === taskId && t.userId === userId);
  if (!existing) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const newCompleted = !existing.completed;
  const updated = db.update('tasks', t => t.id === taskId && t.userId === userId, {
    completed: newCompleted,
    completedAt: newCompleted ? new Date().toISOString() : null
  });

  res.json(updated);
});

// DELETE task
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  const deleted = db.delete('tasks', t => t.id === taskId && t.userId === userId);
  if (!deleted) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.json({ message: 'Task deleted successfully', deleted });
});

export default router;
