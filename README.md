# ⚡ FlowSync AI
### AI-Powered Real-Time Venue Intelligence Platform

> **Hackathon Project** — Built on Google Cloud · Gemini AI · Firebase · Cloud Run

[![Cloud Run](https://img.shields.io/badge/Google%20Cloud-Cloud%20Run-4285F4?logo=googlecloud)](https://cloud.run)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5%20Pro-8E24AA?logo=google)](https://ai.google.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20%20Alpine-339933?logo=nodedotjs)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18%20Vite-61DAFB?logo=react)](https://vitejs.dev)

---

## 🏟️ What is FlowSync AI?

FlowSync AI is a **real-time crowd intelligence platform** for stadiums and large-scale events. It uses **AI agents powered by Google Gemini** to predict crowd movement, optimize routing, and keep thousands of attendees safe — updating every device in the venue simultaneously via **Firestore real-time listeners**.

Open the admin dashboard on a laptop, the map on a phone — both update **instantly** when crowd density changes. No refresh. No polling. Zero stale data.

---

## 🏗️ Google Cloud Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│             USER DEVICES (Mobile · Tablet · Admin PC)            │
│          React PWA  ←──── Firestore onSnapshot() ────►          │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS REST
              ┌──────────────▼──────────────────┐
              │     Cloud Run — Backend API      │  ← Auto-scales 1→100
              │   Node.js 20 · PORT 8080         │
              │   Stateless · Alpine Docker      │
              │   + Crowd Engine (ticks 15s)     │
              └──────┬───────────────┬───────────┘
                     │               │
       ┌─────────────▼──────┐  ┌────▼────────────────┐
       │   Gemini 1.5 Pro   │  │      Firestore       │
       │   (AI Agents +     │  │  venues/stadium-1/   │
       │    LRU Cache 60s)  │  │  ├── zones/          │
       └────────────────────┘  │  orders/             │
                               │  alerts/             │
                               └──────────────────────┘
                                        │
                               Firestore onSnapshot
                                        │
              ┌─────────────────────────▼───────────────────────┐
              │          ALL CONNECTED DEVICES UPDATE            │
              │    Heatmap · Home · Admin · Orders — INSTANT    │
              └─────────────────────────────────────────────────┘
```

### Google Cloud Services Used

| Service | Role |
|---|---|
| **Cloud Run** | Stateless containerised backend, auto-scales to 100 instances |
| **Firestore** | Single source of truth — real-time sync across all devices |
| **Gemini 1.5 Pro** | 5 AI agents with 60s LRU response cache |
| **Cloud Logging** | Structured JSON logs from backend (severity, httpRequest) |
| **Artifact Registry** | Docker image storage for Cloud Run deployments |
| **Secret Manager** | `GEMINI_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` (prod) |

---

## 🤖 AI Multi-Agent System

| Agent | Trigger | Output |
|---|---|---|
| `crowdPredictionAgent` | `/api/predict` | Next 10-min zone overflow forecast |
| `queueOptimizationAgent` | `/api/predict` | Shortest queue routing |
| `userGuidanceAgent` | FloatingChat | Personalized step-by-step routing |
| `adminAlertAgent` | `/api/simulate` | Post-event crowd response plan |
| `emergencyResponseAgent` | Emergency drill | Exit status + evacuation capacity |

All agents share a **60-second LRU cache** keyed by stable context (high zones + attendee count). Under demo spike load, duplicate calls return cached results instantly.

---

## ⚡ Real-Time Architecture (No Polling)

```
Backend Crowd Engine  ──writes──►  Firestore (zones, alerts, orders)
                                         │
                              onSnapshot push to all clients
                                         │
                    ┌────────────────────▼────────────────────┐
                    │   Every connected browser tab / device   │
                    │   updates automatically in < 500ms       │
                    └─────────────────────────────────────────┘
```

The **Crowd Engine** runs inside Cloud Run alongside the Express server:
- Ticks every **15 seconds** with realistic ±30 occupancy drift
- Writes all zones to Firestore in a single **atomic batch**
- Simulate buttons (`goal`, `halftime`, `match_end`, `emergency`) trigger instant crowd spikes

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- Firebase project with Firestore enabled
- Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Backend
```bash
cd backend
cp .env.example .env          # fill in your keys
npm install
npm run dev                    # starts on port 8080
```

**`.env` variables:**
```env
PORT=8080
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
CORS_ORIGIN=http://localhost:5173
```

### Frontend
```bash
cd frontend
cp .env.example .env          # fill in Firebase config
npm install
npm run dev                    # starts on port 5173
```

**`frontend/.env` variables:**
```env
VITE_API_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:abc123
```

---

## 🐳 Docker + Cloud Run Deployment

### Build & Test Locally
```bash
cd backend
docker build -t flowsync-backend .
docker run -p 8080:8080 \
  -e GEMINI_API_KEY=your_key \
  -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/sa.json \
  -v /path/to/sa.json:/secrets/sa.json \
  flowsync-backend
```

### Deploy to Cloud Run
```bash
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1

# 1. Build & push to Artifact Registry
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/flowsync/backend:latest ./backend
docker push $REGION-docker.pkg.dev/$PROJECT_ID/flowsync/backend:latest

# 2. Store secrets in Secret Manager
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
gcloud secrets create firebase-sa --data-file=./service-account.json

# 3. Deploy to Cloud Run
gcloud run deploy flowsync-backend \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/flowsync/backend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 100 \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --set-secrets FIREBASE_SERVICE_ACCOUNT_JSON=firebase-sa:latest
```

### Frontend (Firebase Hosting)
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Cloud Run health check |
| `GET` | `/api/crowd` | Live zone density (Firestore) |
| `GET` | `/api/gates` | Gate wait times |
| `GET` | `/api/stats` | KPI summary |
| `GET` | `/api/wait-times` | Service queue times |
| `POST` | `/api/predict` | Run AI agent query |
| `POST` | `/api/simulate` | Trigger crowd event (→ Firestore) |
| `POST` | `/api/alerts` | Broadcast alert (→ Firestore) |
| `POST` | `/api/orders` | Place food order (→ Firestore) |
| `GET` | `/api/orders/:id` | Get order status |
| `PATCH` | `/api/orders/:id` | Update order status |

---

## 📁 Project Structure

```
FlowSyncAI/
├── backend/
│   ├── server.js              # Express + Cloud Run entry point (PORT 8080)
│   ├── crowd-engine.js        # 🆕 Real-time crowd simulator → Firestore
│   ├── Dockerfile             # 🆕 Multi-stage Alpine build
│   ├── .dockerignore          # 🆕 Excludes node_modules, .env
│   ├── agents/index.js        # 🆕 Gemini agents with 60s LRU cache
│   ├── api/routes.js          # 🆕 Firestore-backed REST API
│   └── package.json
├── firebase/
│   └── firestore-setup.js     # 🆕 Firebase Admin SDK (read/write/seed)
├── frontend/
│   ├── src/
│   │   ├── firebase.js        # 🆕 Firebase client SDK + offline persistence
│   │   ├── useFirestore.js    # 🆕 Real-time hooks (onSnapshot)
│   │   ├── components/
│   │   │   └── Heatmap.jsx    # 🆕 Live Firestore crowd data
│   │   └── pages/
│   │       ├── Home.jsx       # 🆕 Live zone status
│   │       ├── AdminDashboard.jsx # 🆕 Live KPIs + alerts from Firestore
│   │       └── Orders.jsx
│   └── package.json
└── README.md
```

---

## 🎯 Hackathon Demo Highlights

| Feature | How to Demo |
|---|---|
| **Real-time heatmap** | Open in 2 tabs — click Simulate on Admin, watch Heatmap update |
| **Multi-device sync** | Open app on phone + laptop — both heatmaps update simultaneously |
| **AI agents** | Open FloatingChat → ask "Which gate is least crowded?" |
| **Event simulation** | Admin → "⚽ Simulate Goal" → Heatmap spikes in <1s |
| **Broadcast alerts** | Admin → type message → receive on all devices |
| **Order tracking** | Place order → status updates automatically (placed→confirmed→ready) |

---

## 👩‍💻 Team

Built with ❤️ for Google Cloud Hackathon · FlowSync AI Team
