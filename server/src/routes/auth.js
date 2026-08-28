import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';
import { seedUserData } from '../seed.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = db.findOne('users', u => u.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    db.insert('users', newUser);

    seedUserData(userId);

    const token = jwt.sign({ id: userId, email: email.toLowerCase(), name }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: userId, name, email: email.toLowerCase() } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = db.findOne('users', u => u.email === email.toLowerCase());
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Demo 1-Click Login
router.post('/demo', async (req, res) => {
  try {
    const DEMO_ID = 'demo-user-tracker-id';
    let demoUser = db.findOne('users', u => u.id === DEMO_ID);

    if (!demoUser) {
      const hashedPassword = await bcrypt.hash('tracker2026', 10);
      demoUser = {
        id: DEMO_ID,
        name: 'Alex Rivera',
        email: 'demo@tracker.local',
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      db.insert('users', demoUser);
    }

    // Seed data if no habits yet
    seedUserData(DEMO_ID);

    const token = jwt.sign({ id: demoUser.id, email: demoUser.email, name: demoUser.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: demoUser.id, name: demoUser.name, email: demoUser.email } });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ message: 'Server error during demo login' });
  }
});

// Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.findOne('users', u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
