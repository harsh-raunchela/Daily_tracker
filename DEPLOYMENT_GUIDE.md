# 🚀 Production Deployment Guide

This guide details how to deploy the **Habit Tracker & Personal Productivity System** to production.

---

## 📋 Overview of Deployment Methods

| Method | Best For | Setup Complexity | Free Tier Available? |
| :--- | :--- | :--- | :--- |
| **Option 1: Render (Unified)** | **Recommended**: Frontend + Backend in 1 service | ⭐ Very Simple | ✅ Yes (Free) |
| **Option 2: Vercel + Render** | Split setup (Vercel CDN + Render API) | ⭐⭐ Simple | ✅ Yes (Free) |
| **Option 3: Railway / Fly.io** | Single-command or git push deployment | ⭐ Simple | ✅ Yes (Trial/Hobby) |
| **Option 4: Docker / VPS** | Self-hosted Linux VPS (DigitalOcean, AWS, etc.) | ⭐⭐ Moderate | ✅ Depending on host |

---

## 🚀 Option 1: Render (Recommended - 1 Service Full-Stack)

With the unified setup, the Express backend serves both the REST API (`/api/*`) and the compiled React frontend (`/`).

### Step-by-Step Instructions:

1. **Push your code to GitHub / GitLab:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete habit tracker with production deployment setup"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tracker.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** → **Web Service**.
   - Connect your GitHub repository.
   - Configure the following settings:
     - **Name:** `personal-tracker`
     - **Region:** Choose closest to you (e.g. Frankfurt, Oregon, Singapore)
     - **Branch:** `main`
     - **Runtime:** `Node`
     - **Build Command:** `npm run build`
     - **Start Command:** `npm run start`
     - **Instance Type:** `Free`

3. **Set Environment Variables in Render:**
   Under the **Environment** tab, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = *(Click "Generate" or type a random 32+ character string)*

4. **Click "Deploy Web Service"**:
   - Render will run `npm run build` (which compiles the client Vite bundle and installs server dependencies), then start the server.
   - Your application will be live at `https://personal-tracker.onrender.com`!

> 💡 **Tip:** You can also use the included `render.yaml` Blueprint by clicking **New +** → **Blueprint** on Render!

---

## ⚡ Option 2: Split Deployment (Vercel Frontend + Render/Railway Backend)

If you prefer hosting the React frontend on **Vercel Edge Network** and the Express backend on **Render/Railway**:

### Part A: Deploy Backend to Render or Railway
1. Create a **Web Service** on Render with Root Directory set to `server`.
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Environment Variables:**
     - `NODE_ENV` = `production`
     - `JWT_SECRET` = `your-secure-secret`
     - `CLIENT_URL` = `https://your-app.vercel.app` *(or leave blank to allow all)*
2. Note your backend URL (e.g. `https://tracker-api.onrender.com`).

### Part B: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com/) and click **Add New...** → **Project**.
2. Select your repository.
3. In the project settings:
   - **Root Directory:** `client` (or leave default if using root `vercel.json`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://tracker-api.onrender.com` *(your backend URL without trailing slash)*
5. Click **Deploy**.

---

## 🐳 Option 3: Docker / Container Deployment

A multi-stage `Dockerfile` and `docker-compose.yml` are already configured in the repository.

### Run with Docker Compose:
```bash
docker-compose up -d --build
```
Your app will be live at `http://localhost:5000` with persistent storage mounted in `./server/data`.

### Build & Run Docker Image manually:
```bash
docker build -t tracker-app .
docker run -p 5000:5000 -e JWT_SECRET=mysecretkey tracker-app
```

---

## 🧪 Local Production Verification

To test the exact production build on your machine before pushing to Git:

```bash
# 1. Build client bundle and verify dependencies
npm run build

# 2. Run the unified production server
npm run start
```
Then open [http://localhost:5000](http://localhost:5000) in your browser. Both the frontend and backend APIs will be served seamlessly on the same port!
