import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import habitsRoutes from './routes/habits.js';
import tasksRoutes from './routes/tasks.js';
import journalRoutes from './routes/journal.js';
import scoringRoutes from './routes/scoring.js';
import rewardsRoutes from './routes/rewards.js';
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for external frontend or same-origin
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Personal Productivity & Reflection API',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// Static frontend serving in production or when client/dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving compiled client bundle from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for frontend client routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: 'An unexpected server error occurred. Please try again.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Boot server after initializing database connection
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 Tracker Server running at http://localhost:${PORT}`);
  });
}

startServer();


