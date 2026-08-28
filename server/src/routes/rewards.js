import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateMonthlyScore } from './scoring.js';

const router = express.Router();

// GET all rewards with auto-evaluated unlock status based on monthly score
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const month = req.query.month || '2026-08';

  const monthlyScoreData = calculateMonthlyScore(userId, month);
  const currentScore = monthlyScoreData.score;

  const rewards = db.find('rewards', r => r.userId === userId);

  const evaluatedRewards = rewards.map(reward => {
    const isUnlocked = currentScore >= reward.requiredScore;
    // Auto-update unlocked status in db if changed
    if (reward.unlocked !== isUnlocked) {
      db.update('rewards', r => r.id === reward.id, { unlocked: isUnlocked });
    }

    return {
      ...reward,
      unlocked: isUnlocked,
      currentScore,
      pointsNeeded: Math.max(0, reward.requiredScore - currentScore)
    };
  });

  // Sort: Unlocked & Unclaimed first, then Locked (ascending required score), then Claimed
  evaluatedRewards.sort((a, b) => {
    if (a.claimed !== b.claimed) return a.claimed ? 1 : -1;
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return a.requiredScore - b.requiredScore;
  });

  res.json({
    month,
    currentScore,
    rewards: evaluatedRewards
  });
});

// POST create reward
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { title, description, requiredScore, month } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Reward title is required' });
  }

  const scoreTarget = Number(requiredScore) || 80;
  const currentMonth = month || '2026-08';
  const monthlyScoreData = calculateMonthlyScore(userId, currentMonth);
  const unlocked = monthlyScoreData.score >= scoreTarget;

  const newReward = {
    id: crypto.randomUUID(),
    userId,
    title,
    description: description || '',
    requiredScore: scoreTarget,
    month: currentMonth,
    unlocked,
    claimed: false,
    claimedAt: null,
    createdAt: new Date().toISOString()
  };

  db.insert('rewards', newReward);
  res.status(201).json(newReward);
});

// PUT update reward
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const rewardId = req.params.id;
  const { title, description, requiredScore, month } = req.body;

  const existing = db.findOne('rewards', r => r.id === rewardId && r.userId === userId);
  if (!existing) {
    return res.status(404).json({ message: 'Reward not found' });
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (requiredScore !== undefined) updates.requiredScore = Number(requiredScore);
  if (month !== undefined) updates.month = month;

  const updated = db.update('rewards', r => r.id === rewardId && r.userId === userId, updates);
  res.json(updated);
});

// PATCH claim reward
router.patch('/:id/claim', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const rewardId = req.params.id;

  const existing = db.findOne('rewards', r => r.id === rewardId && r.userId === userId);
  if (!existing) {
    return res.status(404).json({ message: 'Reward not found' });
  }

  const newClaimed = !existing.claimed;
  const updated = db.update('rewards', r => r.id === rewardId && r.userId === userId, {
    claimed: newClaimed,
    claimedAt: newClaimed ? new Date().toISOString() : null
  });

  res.json(updated);
});

// DELETE reward
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const rewardId = req.params.id;

  const deleted = db.delete('rewards', r => r.id === rewardId && r.userId === userId);
  if (!deleted) {
    return res.status(404).json({ message: 'Reward not found' });
  }

  res.json({ message: 'Reward deleted successfully', deleted });
});

export default router;
