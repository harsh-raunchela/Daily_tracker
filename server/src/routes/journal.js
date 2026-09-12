import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { getTodayDate, getCurrentMonth } from '../utils/date.js';

const router = express.Router();

// GET all journal entries with search and tag filters
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { search, tag, month } = req.query;

  let entries = db.find('journalEntries', j => j.userId === userId);

  if (month) {
    entries = entries.filter(j => j.date.startsWith(month));
  }

  if (tag) {
    const t = tag.toLowerCase();
    entries = entries.filter(j => j.tags && j.tags.some(tagItem => tagItem.toLowerCase().includes(t)));
  }

  if (search) {
    const s = search.toLowerCase();
    entries = entries.filter(j => 
      (j.title && j.title.toLowerCase().includes(s)) ||
      (j.body && j.body.toLowerCase().includes(s)) ||
      (j.tags && j.tags.some(tagItem => tagItem.toLowerCase().includes(s)))
    );
  }

  // Sort by date descending (newest first)
  entries.sort((a, b) => b.date.localeCompare(a.date));

  res.json(entries);
});

// GET calendar dates with journal entries (for month indicator dots)
router.get('/calendar', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const month = req.query.month || getCurrentMonth();

  const entries = db.find('journalEntries', j => j.userId === userId && j.date.startsWith(month));
  const summary = entries.map(e => ({
    date: e.date,
    mood: e.mood,
    energy: e.energy,
    title: e.title
  }));

  res.json(summary);
});

// GET single journal entry by date (e.g. /api/journal/2026-08-26)
router.get('/:date', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const date = req.params.date;

  const entry = db.findOne('journalEntries', j => j.userId === userId && j.date === date);
  if (!entry) {
    return res.status(404).json({ message: 'No journal entry found for this date' });
  }

  res.json(entry);
});

// POST create or upsert journal entry for date
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { date, title, body, mood, energy, tags, highlights, challenges } = req.body;

  const targetDate = date || getTodayDate();

  const existing = db.findOne('journalEntries', j => j.userId === userId && j.date === targetDate);

  const cleanTags = Array.isArray(tags) 
    ? tags.map(t => t.trim().replace(/^#/, '')).filter(Boolean)
    : (tags ? tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) : []);

  const cleanHighlights = Array.isArray(highlights) ? highlights : (highlights ? [highlights] : []);
  const cleanChallenges = Array.isArray(challenges) ? challenges : (challenges ? [challenges] : []);

  if (existing) {
    const updated = db.update('journalEntries', j => j.id === existing.id, {
      title: title !== undefined ? title : existing.title,
      body: body !== undefined ? body : existing.body,
      mood: mood !== undefined ? Number(mood) : existing.mood,
      energy: energy !== undefined ? Number(energy) : existing.energy,
      tags: cleanTags,
      highlights: cleanHighlights,
      challenges: cleanChallenges,
      updatedAt: new Date().toISOString()
    });
    return res.json(updated);
  } else {
    const newEntry = {
      id: crypto.randomUUID(),
      userId,
      date: targetDate,
      title: title || `Reflection for ${targetDate}`,
      body: body || '',
      mood: mood ? Number(mood) : 3,
      energy: energy ? Number(energy) : 5,
      tags: cleanTags,
      highlights: cleanHighlights,
      challenges: cleanChallenges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.insert('journalEntries', newEntry);
    return res.status(201).json(newEntry);
  }
});

// DELETE journal entry
router.delete('/:date', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const date = req.params.date;

  const deleted = db.delete('journalEntries', j => j.userId === userId && j.date === date);
  if (!deleted) {
    return res.status(404).json({ message: 'Journal entry not found' });
  }

  res.json({ message: 'Journal entry deleted successfully', deleted });
});

export default router;
