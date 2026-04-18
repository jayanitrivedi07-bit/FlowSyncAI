# ⚡ FlowSync AI
### AI-Powered Real-Time Venue Intelligence Platform

> **Hackathon Project** — Built entirely on Google Cloud · Gemini AI · Firebase · Cloud Run

[![Cloud Run](https://img.shields.io/badge/Google%20Cloud-Cloud%20Run-4285F4?logo=googlecloud)](https://cloud.run)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20RT-FFCA28?logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5%20Pro-8E24AA?logo=google)](https://ai.google.dev)
[![Secret Manager](https://img.shields.io/badge/GCP-Secret%20Manager-34A853?logo=googlecloud)](https://cloud.google.com/secret-manager)
[![Cloud Logging](https://img.shields.io/badge/GCP-Cloud%20Logging-4285F4?logo=googlecloud)](https://cloud.google.com/logging)
[![Tests](https://img.shields.io/badge/Tests-16%20Passing-brightgreen?logo=jest)](./backend/tests/api.test.js)
[![Node.js](https://img.shields.io/badge/Node.js-20%20Alpine-339933?logo=nodedotjs)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18%20Vite-61DAFB?logo=react)](https://vitejs.dev)

---

## 🏟️ What is FlowSync AI?

FlowSync AI is a **real-time crowd intelligence platform** for stadiums and large-scale events. It uses **5 specialised AI agents powered by Google Gemini 1.5 Pro** to predict crowd movement, optimise gate routing, and keep thousands of attendees safe — pushing updates to every connected device **simultaneously via Firestore real-time listeners**.

Open the admin dashboard on a laptop, the heatmap on a phone — **both update in under 500 ms** the moment crowd density changes. No polling. No refresh. Zero stale data.

---

## 🏗️ Google Cloud Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│             USER DEVICES (Mobile · Tablet · Admin PC)            │
│          React PWA  ←──── Firestore onSnapshot() ────►          │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS REST
              ┌──────────────▼────────────────────────┐
              │   Cloud Run — FlowSync Backend API     │  ← Auto-scales 1 → 100 instances
              │   Node.js 20 · PORT $PORT (env)        │  ← Stateless, Alpine Docker
              │   Crowd Engine — ticks every 15 s      │  ← Writes to Firestore atomically
              └──────┬──────────────────┬──────────────┘
                     │                  │
       ┌─────────────▼──────┐  ┌────────▼──────────────────────┐
       │   Gemini 1.5 Pro   │  │  Firestore (Real-time DB)      │
       │   5 AI Agents +    │  │  venues/stadium-1/             │
       │   60s LRU Cache    │  │  ├── zones/          (crowd)   │
       └────────────────────┘  │  orders/             (food)    │
                               │  alerts/             (safety)  │
              ┌────────────────┴───────────────────────┐
              │  GCP Secret Manager                     │
              │  ├── gemini-api-key                     │
              │  └── firebase-service-account-json      │
              └──────────────────────────────────────────┘
                                        │
                               Firestore onSnapshot
                                        │
              ┌─────────────────────────▼─────────────────────────┐
              │          ALL CONNECTED DEVICES UPDATE              │
              │    Heatmap · Home · Admin · Orders — < 500 ms     │
              └────────────────────────────────────────────────────┘
```

---

## ☁️ Google Cloud Services — Deep Dive

| Service | How FlowSync Uses It | Why It Matters |
|---|---|---|
| **Cloud Run** | Hosts the Node.js backend in a stateless Alpine container. Scales from **1 → 100 instances** automatically under crowd simulation load. PORT is injected via `$PORT` env var per Cloud Run spec. | Zero-config scaling — no Kubernetes ops, pay-per-request |
| **Firestore (Real-time)** | All crowd zone data, food orders, and safety alerts are written here. Every connected device holds an **`onSnapshot` listener** — pushes land in < 500 ms without any client polling. | The backbone of multi-device real-time sync |
| **Gemini 1.5 Pro** | Powers 5 specialised AI agents. Responses are cached with a **60-second LRU cache** keyed on stable context fingerprints, so burst demo traffic never hammers the API. | Natural language crowd reasoning + cost-efficient inference |
| **Cloud Logging** | Backend emits **structured JSON logs** `{ severity, message, httpRequest, timestamp }` on every request. Logs are queryable in Cloud Logging console by severity. | Full operational visibility in production |
| **Secret Manager** | `GEMINI_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` are stored as versioned secrets. Injected into Cloud Run at deploy time via `--set-secrets`. **No credentials in source code or Docker images.** | Production-grade secrets hygiene |
| **Artifact Registry** | Docker images are pushed to a private registry and pulled by Cloud Run at deploy. | Immutable, versioned image store |
| **Firebase Hosting** | React Vite frontend is deployed as a global CDN-backed SPA with a single `firebase deploy`. | Sub-100 ms global page load |

---

## ⚡ Real-Time Architecture — How It Actually Works

```
                 ┌─────────────────────────────────────┐
                 │   Cloud Run Crowd Engine (15s tick)  │
                 │   1. Reads current zone occupancy    │
                 │   2. Applies ±30 occupancy drift     │
                 │   3. Recalculates density High/Med/Low│
                 │   4. ATOMIC batch write → Firestore  │
                 └──────────────┬──────────────────────┘
                                │ Firestore write
                                ▼
              ┌─────────────────────────────────────────────┐
              │  Firestore onSnapshot pushes to ALL clients  │
              │  (WebSocket-like — Firestore manages it)     │
              └──────┬──────────────┬─────────────┬─────────┘
                     ▼              ▼             ▼
               Phone Heatmap   Laptop Admin   Tablet Home
                (< 500 ms)     (< 500 ms)    (< 500 ms)
```

**No polling. No setInterval fetches. No stale data.**
The Crowd Engine writes to Firestore; Firestore pushes to every subscribed client. Multi-device synchronisation comes for free.

### Event Simulation → Real-Time Cascade
```
Admin clicks "⚽ Simulate Goal"
       │
       ▼  POST /api/simulate { event: "goal" }
       │
       ├── Gemini adminAlertAgent generates crowd response plan
       │
       └── writeAlert() → Firestore alerts/
              │
              └── onSnapshot fires on ALL devices → alert banner appears
```

---

## 🤖 AI Multi-Agent System

| Agent | Endpoint / Trigger | Role |
|---|---|---|
| `crowdPredictionAgent` | `POST /api/predict` | Forecasts zone overflow 10 min ahead |
| `queueOptimizationAgent` | `POST /api/predict` | Identifies shortest gate routes |
| `userGuidanceAgent` | FloatingChat widget | Personalized step-by-step routing in natural language |
| `adminAlertAgent` | `POST /api/simulate` | Generates post-event crowd response plans |
| `emergencyResponseAgent` | Emergency drill | Calculates safe exit capacity and evacuation timing |

All agents share a **60-second LRU cache** keyed on stable context fingerprints (high-occupancy zones + total attendee count). Duplicate requests under burst demo load return cached results < 5 ms.

### Structured Cloud Logging from AI Agents

Every Gemini inference logs to Cloud Logging in structured JSON:
```json
{
  "severity": "INFO",
  "message": "[Cloud Run] Triggering Gemini inference via Agent ID: crowdPredictionAgent",
  "labels": { "service": "gemini-1.5-pro" },
  "timestamp": "2026-04-18T15:00:00Z"
}
```

---

## 🔒 Security — Secret Manager Integration

Secrets are **never in source code or Docker images**. They live in GCP Secret Manager and are injected at Cloud Run deploy time:

```bash
# Store secrets (done once)
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
gcloud secrets create firebase-sa --data-file=./service-account.json

# Cloud Run reads them at boot (no env file in container)
gcloud run deploy flowsync-backend \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --set-secrets FIREBASE_SERVICE_ACCOUNT_JSON=firebase-sa:latest
```

In `firestore-service.js`, the app detects the environment:
```js
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  // Cloud Run: JSON key from Secret Manager
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  initializeApp({ credential: cert(sa) });
  log('[GCP Secret Manager] Securely loaded Firebase credentials');
} else {
  // Local dev: Application Default Credentials
  initializeApp();
}
```

---

## 🧪 Testing

16 unit tests covering core API endpoints. All tests run **fully offline** — Firebase, Gemini, and the Crowd Engine are mocked via `jest.unstable_mockModule`.

```bash
cd backend
npm test
```

```
PASS tests/api.test.js
  FlowSync AI — Core API Tests
    GET /health
      ✓ returns 200 with status ok
      ✓ response includes service name and timestamp
      ✓ service name identifies FlowSync AI
    GET /api/crowd
      ✓ returns 200 with success flag
      ✓ data is an array of zone objects
      ✓ each zone has required fields
      ✓ response includes source field (firestore or mock)
      ✓ response includes ISO timestamp
    GET /api/gates
      ✓ returns 200 with success flag
      ✓ data contains exactly 4 gates (A, B, C, D)
      ✓ recommendedGate is one of A, B, C, D
      ✓ each gate has id, wait, occupancy, capacity and status
      ✓ gate status values are High, Medium, or Low
      ✓ tip field provides a human-readable recommendation
    GET /api/stats
      ✓ returns 200 with venue KPIs
      ✓ safetyStatus is NORMAL or CAUTION

Tests: 16 passed, 16 total  |  Time: ~1.4 s
```

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
npm test                       # run 16 unit tests (no cloud credentials needed)
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

# 1. Build & push image to Artifact Registry
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/flowsync/backend:latest ./backend
docker push $REGION-docker.pkg.dev/$PROJECT_ID/flowsync/backend:latest

# 2. Store secrets in GCP Secret Manager (credentials never in image)
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
gcloud secrets create firebase-sa --data-file=./service-account.json

# 3. Deploy — Cloud Run auto-scales 1→100, health-checked on /health
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
| `GET` | `/health` | Cloud Run health check — used by Cloud Run's liveness probe |
| `GET` | `/api/crowd` | Live zone density from Firestore (falls back to mock) |
| `GET` | `/api/gates` | Gate wait times with AI-recommended best gate |
| `GET` | `/api/stats` | KPI summary — total crowd, high density zones, safety status |
| `GET` | `/api/wait-times` | Service queue wait times |
| `POST` | `/api/predict` | Run a named Gemini AI agent |
| `POST` | `/api/simulate` | Trigger crowd event → Gemini agent + Firestore alert |
| `POST` | `/api/alerts` | Broadcast alert → Firestore → all devices instantly |
| `POST` | `/api/orders` | Place food order → Firestore → status updates auto-push |
| `GET` | `/api/orders/:id` | Get order status |
| `PATCH` | `/api/orders/:id` | Update order status |

---

## 📁 Project Structure

```
FlowSyncAI/
├── backend/
│   ├── server.js              # Express + Cloud Run entry point (PORT env var)
│   ├── crowd-engine.js        # Real-time crowd simulator → Firestore (15s ticks)
│   ├── firestore-service.js   # Firebase Admin SDK (read/write/seed + Secret Manager)
│   ├── Dockerfile             # Multi-stage Alpine build (< 200MB image)
│   ├── agents/index.js        # 5 Gemini AI agents with 60s LRU cache
│   ├── api/routes.js          # Firestore-backed REST API (all endpoints)
│   ├── tests/api.test.js      # 16 Jest unit tests (fully mocked, no credentials)
│   └── package.json
├── firebase/
│   └── firestore-setup.js     # Firebase Admin SDK seed + schema helpers
├── frontend/
│   ├── src/
│   │   ├── firebase.js        # Firebase client SDK + offline persistence
│   │   ├── useFirestore.js    # Real-time hooks (onSnapshot listeners)
│   │   ├── components/
│   │   │   ├── Heatmap.jsx    # Live Firestore crowd data → colour-coded grid
│   │   │   └── FloatingChat.jsx # Gemini userGuidanceAgent chat widget
│   │   └── pages/
│   │       ├── Home.jsx       # Live zone status + AI recommendations
│   │       ├── AdminDashboard.jsx # Live KPIs + event simulation + alert broadcast
│   │       └── Orders.jsx     # Real-time order status (Firestore onSnapshot)
│   └── package.json
├── cloudbuild.yaml            # Cloud Build CI/CD pipeline
└── README.md
```

---

## 🎬 30-Second Demo Script

> **[OPEN two browser windows side-by-side — one Admin Dashboard, one Heatmap]**

**[0:00 — 0:08] Real-time heatmap intro**
*"This is FlowSync AI — a real-time crowd management system running on Google Cloud Run. Every colour on this heatmap is live data from Firestore, pushed to this device without any polling."*

**[0:08 — 0:18] Multi-device sync**
*"Watch both screens. I'll trigger a Goal simulation on the Admin panel…"*
→ Click **⚽ Simulate Goal** on Admin Dashboard
*"…and the heatmap on both screens updated in under half a second. That's Firestore onSnapshot delivering changes to every connected device simultaneously."*

**[0:18 — 0:28] AI recommendation**
→ Open FloatingChat → type: **"Which gate should I use right now?"**
*"This is hitting our Gemini 1.5 Pro multi-agent system running on Cloud Run. The AI reads live crowd density from Firestore and gives a personalised routing recommendation."*

**[0:28 — 0:38] Google Cloud summary**
*"The whole system runs on — Cloud Run for auto-scaling, Firestore for real-time multi-device sync, Gemini for AI, Secret Manager for credentials, and Cloud Logging for observability. No credentials in code, no polling, fully serverless."*

---

## 🎯 Hackathon Demo Highlights

| Feature | How to Demo |
|---|---|
| **Real-time heatmap** | Open in 2 tabs — click Simulate on Admin, watch Heatmap update in < 500ms |
| **Multi-device sync** | Open app on phone + laptop — both heatmaps update simultaneously |
| **AI agents** | FloatingChat → ask *"Which gate is least crowded?"* |
| **Event simulation** | Admin → "⚽ Simulate Goal" → Heatmap spikes, alert fires on all devices |
| **Broadcast alerts** | Admin → type message → appears on all connected devices instantly |
| **Order tracking** | Place order → status auto-progresses: placed → confirmed → preparing → ready |
| **Testing** | `cd backend && npm test` → 16 unit tests, 0 credentials needed |

---

## 📊 Google Cloud Services Checklist

- [x] **Cloud Run** — deployed, auto-scaling 1→100, stateless, health-checked
- [x] **Firestore** — real-time listeners on all pages, batch atomic writes
- [x] **Gemini 1.5 Pro** — 5 agents with LRU cache, structured logging
- [x] **Secret Manager** — all credentials stored as versioned secrets
- [x] **Cloud Logging** — structured JSON logs `{ severity, httpRequest, timestamp }`
- [x] **Artifact Registry** — Docker image storage
- [x] **Firebase Hosting** — frontend CDN deployment

---

## 👩‍💻 Team

Built with ❤️ for Google Cloud Hackathon · FlowSync AI Team
