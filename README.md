# FlowSync AI 🏟️⚡

> **Hackathon-Ready | AI-Powered Venue Intelligence Platform**  
> Real-time crowd management with multi-agent AI, predictive analytics, and smart routing — built for stadiums, concerts, and large-scale events.

---

## 🚀 Live Demo
> Deploy to Firebase Hosting via `firebase deploy` after running `npm run build` in `/frontend`.

---

## 🧠 Problem Statement

Managing crowds in large venues is reactive, not proactive. Staff can't predict bottlenecks before they occur, leading to safety risks, long queues, and poor visitor experiences. Traditional apps offer static maps that become instantly outdated when a crowd shifts.

## 💡 Solution

**FlowSync AI** combines real-time crowd sensing with a **5-agent Gemini AI system** to predict crowd movement 10–15 minutes ahead, suggest optimal routing to users, and alert administrators to safety risks. The platform makes split-second decisions and actively routes traffic to keep crowds flowing efficiently.

---

## 🏗️ Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                │
│  Home · Map Heatmap · Smart Ticket · Orders              │
│  User Stats · Admin Dashboard · Floating Context Chat    │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API
┌────────────────────────▼─────────────────────────────────┐
│              Node.js + Express Backend                   │
│  /crowd · /wait-times · /predict · /simulate             │
│  /gates · /orders · /alerts                              │
└──────────┬─────────────────────────────┬─────────────────┘
           │                             │
┌──────────▼──────┐           ┌──────────▼──────────────────┐
│  Firebase       │           │  Gemini 1.5 Pro (AI)         │
│  Firestore      │           │  ┌─ Crowd Prediction Agent   │
│  (Crowd Data,   │           │  ├─ Queue Optimization Agent │
│   Wait, Orders) │           │  ├─ User Guidance Agent      │
└─────────────────┘           │  ├─ Admin Alert Agent        │
                              │  └─ Emergency Response Agent │
                              └──────────────────────────────┘
```

---

## 🤖 AI Multi-Agent System

| Agent | Role |
|-------|------|
| **Crowd Prediction Agent** | Forecasts zone density 10–15 min ahead based on historical flow and current entry rate. |
| **Queue Optimization Agent** | Calculates wait times and load-balances by suggesting fastest service queues. |
| **User Guidance Agent** | Translates complex routing calculations into clear, contextual natural language advice. |
| **Admin Alert Agent** | Automatically detects and escalates congestion emergencies to admins. |
| **Emergency Response Agent** | Computes immediate evacuation routing in crisis scenarios based on clear paths. |

---

## ✨ Features

### Frontend Experiences
- 🎯 **Decision-First Overview** — A hero action interface guiding the user on "What to do right now" (e.g., "Go to Gate B • 2m wait").
- 📱 **Smart Entry Ticket** — A generative dynamic QR ticket featuring integrated AI intelligence. Prominently recommends least-crowded gates directly on the entry pass.
- 🗺️ **Interactive Stadium Heatmap (Tap-First)** — Fast, mobile-optimized heatmap with pulsing rings on critical zones and auto-generated "directional routing arrows" that pop up on tap without needing chatbot interaction.
- 🍔 **Food Ordering System** — Full menu browsing, interactive cart, and an order state progress tracker (Placed → Confirmed → Preparing → Ready) to prevent users standing in lines.
- 💬 **Context-Aware Floating Assistant** — A venue-aware chatbot that pre-generates dynamic query chips based on *live* zone states (e.g., "Avoid Gate A — Gate C is 3min faster"), simulating typewriter-style AI thinking states.
- 📊 **Admin Dashboard** — Live Recharts (Area/Bar charts), full event-simulation suites (Goal/Halftime/Match End), and an integrated **Live Alerts Broadcast** system.
- 📈 **Personalized User Stats** — IntersectionObserver animated counters, visual activity timelines (drawn path-on-map simulations), and percentile comparison charts ("You vs Avg Attendee").

### Backend Core
- Fully built REST layer for processing gates, dynamic ticket routing, and order mock progression:
  - `GET /api/gates` — live gate wait times + AI recommendations
  - `POST /api/orders` & `GET /api/orders/:id` — backend simulated state progression 
  - `POST /api/simulate` — dynamic crowd event simulation 
  - `POST /api/alerts` — system-wide push broadcasts

### UI/UX Design System
- 🎨 Deep Blue `#1E3A8A` + Gold `#FBBF24` + Emerald `#10B981` color palette
- 🔮 Absolute premium glassmorphism layouts (`backdrop-filter`) and sophisticated micro-animations (e.g., pulsing ring alerts, staggered fades)
- ♿ Built with ARIA labels and pure vanilla CSS `index.css` global styles — No heavy generic CSS frameworks.
- 📱 Flawless mobile-responsive design utilizing a horizontal-scrolling bottom nav.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, React Router v6 |
| Analytics/Visuals | Recharts, Lucide React (Icons) |
| Backend | Node.js, Express 4 |
| AI | Google Gemini 1.5 Pro (`@google/generative-ai`) |
| Database | Firebase Firestore (simulated in-memory for dev) |
| Hosting | Firebase Hosting (frontend) |
| Deployment | Docker + Google Cloud Run (backend) |

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+ (LTS)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Backend Setup
```bash
cd backend
npm install
# Create .env file:
echo "GEMINI_API_KEY=your_key_here" > .env
npm run dev        # starts on http://localhost:3000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

---

## 🌐 Deployment

### Firebase Hosting (Frontend)
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Docker (Backend)
```bash
cd backend
docker build -t flowsync-backend .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key flowsync-backend
```

---

## 🏆 Built For
> Hackathon submission — showcasing multi-agent AI orchestration, real-time venue intelligence, and premium UX design.

**Team:** Jayani Trivedi | FlowSync AI | 2026
