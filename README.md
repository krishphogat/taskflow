# TaskFlow

A **full‑stack task management application** built with a modern, premium UI.

## Overview
TaskFlow lets users **register**, **log in**, and manage tasks across categories. It features:
- Dark‑mode glassmorphism design with smooth micro‑animations.
- React + Vite front‑end with a responsive sidebar and dashboard.
- Node.js + Express REST API.
- PostgreSQL persistence (optional) – the app also works **without a database** thanks to an in‑memory fallback for authentication.
- JWT‑based authentication stored in `localStorage`.
- Docker‑compatible (PostgreSQL) configuration.

## Tech Stack
| Layer | Technology |
|-------|------------|
| Front‑end | React 18, Vite 5, Axios, Tailored CSS (glassmorphism) |
| Back‑end | Node.js 26, Express 4, JWT, Bcryptjs |
| Database | PostgreSQL (optional) |
| Dev tools | Nodemon, dotenv |

## Quick Start (Local Development)
```bash
# Clone the repo (already done)
cd /Users/krish/.gemini/antigravity/scratch/taskflow

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..

# Set environment variables
cat > backend/.env <<EOF
PORT=5001
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
EOF

# Start services (in separate terminals or use tmux)
# Backend
tcd backend && npm run dev
# Frontend
tcd frontend && npm run dev
```
Open **http://localhost:5173** in a browser.

### Why the backend runs on **5001**
During development the default port `5000` was already in use, so the API was switched to `5001`. The Vite proxy and API base URL have been updated accordingly.

## Authentication Behaviour
- **Database available**: Users are persisted in PostgreSQL and default categories are created on registration.
- **Database unavailable**: The server falls back to an **in‑memory store**, allowing registration/login to work without a DB. This is useful for demoing the UI quickly.

## API Endpoints
```
POST   /api/auth/register   → register new user
POST   /api/auth/login      → login & receive JWT
GET    /api/auth/profile    → current user (auth required)
GET    /api/tasks           → list tasks (auth required)
POST   /api/tasks           → create task
PUT    /api/tasks/:id       → update task
DELETE /api/tasks/:id       → delete task
GET    /api/tasks/stats     → task statistics
GET    /api/categories      → list categories
POST   /api/categories      → create category
PUT    /api/categories/:id  → update category
DELETE /api/categories/:id  → delete category
```
All `/api/*` routes are proxied by Vite to `http://localhost:5001`.

## Project Structure
```
taskflow/
├─ backend/               # Express API
│   ├─ src/
│   │   ├─ config/        # DB pool & schema
│   │   ├─ controllers/   # auth, task, category logic
│   │   ├─ middleware/    # JWT auth
│   │   └─ index.js       # server entry point
│   └─ .env                # environment variables
├─ frontend/              # React Vite app
│   ├─ src/
│   │   ├─ api/           # Axios instance + endpoints
│   │   ├─ context/       # AuthContext provider
│   │   ├─ pages/         # AuthPage, Dashboard, TasksPage, CategoriesPage
│   │   ├─ App.jsx        # Layout & routing
│   │   └─ main.jsx       # React root
│   ├─ index.html          # HTML entry point
│   └─ vite.config.js      # Vite config with proxy
├─ generate_ppt.py         # PowerPoint generator (demo)
└─ README.md               # ← this file
```

## Deploying / Production Build
```bash
# Frontend build
tcd frontend && npm run build
# Serve the static files with any static server (e.g., serve, nginx)
```
The backend can be containerised with Docker if desired.

## Contributing
Feel free to open PRs or issues. When contributing:
1. Fork the repo.
2. Create a feature branch.
3. Ensure `npm run dev` works for both frontend and backend.
4. Submit a pull request.

---
© 2024‑2026 TaskFlow – built with love by **Krish Phogat**. All rights reserved.
