# 🌌 Daily Tracker & Personal Productivity Operating System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-success?style=for-the-badge&logo=render&logoColor=white)](https://daily-tracker-1-vf93.onrender.com)
[![GitHub License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

> 🚀 **Live Deployed App:** [https://daily-tracker-1-vf93.onrender.com](https://daily-tracker-1-vf93.onrender.com)

A modern, full-stack personal productivity and self-reflection system combining **Habit Tracking**, **Daily Task Management**, **Reflective Journaling**, **Transparent Performance Scoring**, and **Milestone Rewards**.

---

## ✨ Features

- 📅 **Habit Tracker & Calendar Matrix**:
  - Daily habit check-offs, streaks tracking (`currentStreak`, `longestStreak`, `totalCompleted`), and category/difficulty weights.
  - Interactive monthly calendar matrix visualizing consistency across any selected month.
- 🎯 **Task & Priority Manager**:
  - Filter tasks by *Today*, *Upcoming*, *Completed*, and *Overdue*.
  - Assign priority levels (*High*, *Medium*, *Low*) and custom categories.
- 📖 **Daily Journal & Reflection**:
  - Private daily entries with mood ratings (1–5), energy levels (1–10), tags, and key takeaways.
- ⚖️ **Weighted Monthly Scoring Engine**:
  - Transparent formula: **50%** Consistency + **20%** Difficulty + **15%** Streaks + **15%** Month-Over-Month Improvement.
  - Gamified achievement levels: *Needs Work*, *Getting Started*, *Good*, *Excellent*, and *Elite*.
- 🎁 **Milestone Rewards**:
  - Define custom personal incentives unlocked automatically when hitting monthly score thresholds.
- 📊 **Rich Analytics & Data Telemetry**:
  - Daily trend graphs, weekday performance distributions, and habit comparisons powered by Recharts.
- 🌓 **Dual Interface Modes**:
  - **Story Mode**: Interactive editorial flow with live habit toggles, task completion, and interactive scoring formula simulator.
  - **Workspace Mode**: Power-user dashboard with focused management pages.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Express.js, REST API
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Deployment**: Ready for Render, Vercel, Railway, or Docker

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/harsh-raunchela/Daily_tracker.git
cd Daily_tracker

# Install client and server dependencies
npm run install:all
```

### 2. Run the Development Servers
In two separate terminals:

```bash
# Terminal 1: Backend API (runs on http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend Client (runs on http://localhost:3000)
npm run dev:client
```

Open [http://localhost:3000](http://localhost:3000) and click **"Demo 1-Click Access"** to immediately explore with pre-seeded historical data!

---

## 📦 Production Deployment

### Option A: Render (Unified 1-Service Full-Stack)
1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
3. Connect your repository and configure:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
   - **Environment Variables:**
     - `NODE_ENV` = `production`
     - `PORT` = `10000`
     - `JWT_SECRET` = `(your-secret-key)`
4. Deploy!

### Option B: Docker Container
```bash
docker-compose up -d --build
```
Your app will be live at `http://localhost:5000`.

*For detailed instructions on Vercel, Railway, and Docker, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).*

---

## 📄 License

MIT License. Designed and built as a personal productivity companion.
