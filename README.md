# FlowSync AI 🏟️⚡

> **Hackathon-Ready | AI-Powered Venue Intelligence Platform**  
> Real-time crowd management with multi-agent AI, predictive analytics, and smart routing — built for stadiums, concerts, and large-scale events.

---

## 🚀 Live Demo
> Deploy to Firebase Hosting via `firebase deploy` after running `npm run build` in `/frontend`.

---

## 🧠 Problem Statement

Managing crowds in large venues is reactive, not proactive. Staff can't predict bottlenecks before they occur, leading to safety risks, long queues, and poor visitor experiences.

## 💡 Solution

**FlowSync AI** combines real-time crowd sensing with a **5-agent Gemini AI system** to predict crowd movement 10–15 minutes ahead, suggest optimal routing to users, and alert administrators to safety risks — all in a stunning interactive dashboard.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                │
│  Home · Map Heatmap · Admin Dashboard · Stats · Profile  │
│              + Floating AI Chat (Global)                 │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API
┌────────────────────────▼─────────────────────────────────┐
│              Node.js + Express Backend                   │
│  GET /crowd · GET /wait-times · POST /predict            │
│  GET /stats · POST /simulate                             │
└──────────┬─────────────────────────────┬─────────────────┘
           │                             │
┌──────────▼──────┐           ┌──────────▼──────────────────┐
│  Firebase       │           │  Gemini 1.5 Pro (AI)         │
│  Firestore      │           │  ┌─ Crowd Prediction Agent   │
│  (Crowd Data,   │           │  ├─ Queue Optimization Agent │
│   Wait Times,   │           │  ├─ User Guidance Agent      │
│   Alerts)       │           │  ├─ Admin Alert Agent        │
└─────────────────┘           │  └─ Emergency Response Agent │
                              └──────────────────────────────┘
```

---

## 🤖 AI Multi-Agent System

| Agent | Role |
|-------|------|
| **Crowd Prediction Agent** | Forecasts zone density 10–15 min ahead |
| **Queue Optimization Agent** | Suggests fastest service queues |
| **User Guidance Agent** | Provides personalized navigation paths |
| **Admin Alert Agent** | Detects and escalates density emergencies |
| **Emergency Response Agent** | Monitors exits, evacuation routing |

---

## ✨ Features

### Frontend
- 🗺️ **Interactive Stadium Heatmap** — hover zones for live density, wait times, and AI routing suggestions
- 🃏 **Zone Cards** — glassmorphism cards with occupancy bars, trend indicators, and quick actions
- 💬 **Floating AI Assistant** — persistent on all pages, contextual suggestions, typing indicators
- 📊 **Admin Dashboard** — AreaCharts, BarCharts (Recharts), event simulation (Goal/Halftime/Match End)
- 📈 **User Stats Page** — steps saved, time saved, queues avoided, AI badges
- 👤 **User Profile** — routing preferences, accessibility mode, notification settings

### Backend
- `GET /api/crowd` — real-time zone density data
- `GET /api/wait-times` — live service queue data
- `GET /api/stats` — venue-wide KPI summary
- `POST /api/predict` — trigger any AI agent
- `POST /api/simulate` — event simulation (goal, halftime, emergency)

### Design
- 🎨 Deep Blue `#1E3A8A` + Gold `#FBBF24` color system
- 🔮 Pure glassmorphism cards with `backdrop-filter`
- ✨ Staggered fade-up entrance animations
- ♿ Full ARIA labels + keyboard navigation
- 📱 Fully responsive — mobile bottom-nav, desktop sidebar

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, React Router v6 |
| Charts | Recharts |
| Backend | Node.js, Express 4 |
| AI | Google Gemini 1.5 Pro (`@google/generative-ai`) |
| Database | Firebase Firestore (simulated) |
| Hosting | Firebase Hosting (frontend) |
| Deployment | Docker + Google Cloud Run (backend) |
| Fonts | Poppins (Google Fonts) |

---

## 📂 Project Structure

```
FlowSyncAI-1/
├── frontend/
│   ├── src/
│   │   ├── components/     # Navigation, Heatmap, FloatingChat
│   │   ├── pages/          # Home, Map, AdminDashboard, UserStats, Profile
│   │   ├── App.jsx         # Routing setup
│   │   └── index.css       # Global design system
│   ├── index.html
│   └── vite.config.js
├── backend/
│   ├── api/routes.js       # REST endpoints
│   ├── agents/index.js     # Multi-agent Gemini orchestration
│   ├── server.js           # Express entry point
│   └── Dockerfile          # Cloud Run ready
├── firebase/
│   └── firestore-setup.js  # Mock Firestore data + getVenueSnapshot()
├── prompts/
│   └── agent-prompts.js    # Master system prompts for all 5 agents
├── firebase.json            # Firebase Hosting config
├── .gitignore
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+ (LTS)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Backend
```bash
cd backend
npm install
# Create .env file:
echo "GEMINI_API_KEY=your_key_here" > .env
npm run dev        # starts on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

### Docker (Backend)
```bash
cd backend
docker build -t flowsync-backend .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key flowsync-backend
```

---

## 🌐 Deployment

### Firebase Hosting (Frontend)
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Google Cloud Run (Backend)
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/flowsync-backend
gcloud run deploy flowsync-backend \
  --image gcr.io/YOUR_PROJECT/flowsync-backend \
  --platform managed \
  --set-env-vars GEMINI_API_KEY=your_key
```

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini Pro API key |
| `PORT` | Backend port (default: 3000) |

---

## 🏆 Built For
> Hackathon submission — showcasing multi-agent AI orchestration, real-time venue intelligence, and premium UX design.

**Team:** Jayani Trivedi | FlowSync AI | 2026
