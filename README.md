# ⚡ FlowSync AI
**🏟️ AI-Powered Real-Time Venue Intelligence Platform**

Predict. Route. Optimize.  
*Turning chaotic crowds into seamless experiences using multi-agent AI.*

## 🚀 Live Demo

🔗 **View Deployed App**  
*(Add your Vercel link here)*

---

## 🧠 The Problem

Large venues like stadiums, concerts, and festivals suffer from reactive crowd management:

- 🚫 No prediction of congestion
- ⏳ Long queues & poor flow
- ⚠️ Safety risks during peak moments
- 🗺️ Static maps that become instantly outdated

## 💡 The Solution

**FlowSync AI** transforms crowd management from reactive → predictive using a multi-agent AI system. 

It:
- 🔮 Predicts crowd movement 10–15 minutes ahead
- 🧭 Dynamically routes users to optimal paths
- 🚨 Alerts admins before congestion becomes dangerous
- ⚡ Makes real-time micro-decisions at scale

---

## 🏗️ System Architecture

```text
Frontend (React + Vite)
   ↓
Node.js + Express API Layer
   ↓
Firebase Firestore (Realtime Data)
   ↓
Gemini 1.5 Pro (Multi-Agent AI System)
```

## 🔁 Data Flow

1. **Crowd data ingested** (gates, orders, zones)
2. **AI agents process & predict** flow
3. **APIs serve optimized decisions**
4. **UI updates instantly** with actionable insights

---

## 🤖 Multi-Agent AI System

| Agent | Responsibility |
|-------|----------------|
| 🔮 **Crowd Prediction Agent** | Forecasts density 10–15 mins ahead |
| ⏱️ **Queue Optimization Agent** | Calculates wait times & balances load |
| 🧭 **User Guidance Agent** | Converts logic → simple user actions |
| 🚨 **Admin Alert Agent** | Detects congestion risks automatically |
| 🆘 **Emergency Response Agent** | Generates evacuation routes |

---

## ✨ Key Features

### 🎯 Decision-First UX
*“What should I do right now?”*
Smart suggestions like: **“Go to Gate B • 2 min wait”**

### 📱 Smart AI Ticket
- Dynamic QR ticket
- Built-in routing intelligence
- Recommends least crowded entry in real-time

### 🗺️ Interactive Heatmap
- Live crowd density visualization
- Tap zones → instant routing arrows
- Pulsing alerts on critical congestion

### 🍔 Smart Food Ordering
- Skip physical queues entirely
- Real-time order tracking:  
  *Placed → Confirmed → Preparing → Ready*

### 💬 Context-Aware AI Assistant
- Auto-generated smart prompts
- Live-aware suggestions  
  *“Avoid Gate A → Gate C is faster”*

### 📊 Admin Dashboard
- Real-time analytics (Recharts)
- Event simulation engine
- Live alert broadcasting

### 📈 Personalized User Insights
- Movement tracking
- Behavioral analytics
- “You vs Average Attendee” comparisons

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, React Router |
| **UI/UX** | Glassmorphism, Vanilla CSS, Lucide Icons |
| **Charts** | Recharts |
| **Backend** | Node.js, Express |
| **AI Engine** | Gemini 1.5 Pro |
| **Database** | Firebase Firestore |
| **Hosting** | Vercel (Frontend), Cloud Run / Docker (Backend) |

---

## ⚡ Getting Started

### 1️⃣ Clone Repo
```bash
git clone https://github.com/your-username/flowsync-ai.git
cd flowsync-ai
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```
Create `.env`:
```text
GEMINI_API_KEY=your_api_key_here
```
Run:
```bash
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment

### 🚀 Vercel (Frontend)
```bash
cd frontend
npm run build
vercel deploy
```

### 🐳 Backend (Docker / Cloud Run)
```bash
cd backend
docker build -t flowsync-backend .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key flowsync-backend
```

---

## 🎨 Design Philosophy
- 🌌 **Dark Premium UI** — Deep Blue + Gold + Emerald
- 🔮 **Glassmorphism** + Micro-animations
- ⚡ **Instant feedback loops**
- 📱 **Mobile-first experience**
- ♿ **Accessibility-first** (ARIA compliant)

---

## 🏆 Why This Project Stands Out

- ✅ Real-world high-impact problem
- ✅ Multi-agent AI (not just chatbot wrapper)
- ✅ Predictive intelligence (not reactive dashboards)
- ✅ Strong system design + clean architecture
- ✅ Premium UX (rare in hackathon projects)

---

## 🔮 Future Scope
- 📡 IoT integration (CCTV, sensors)
- 🧠 Reinforcement learning for crowd optimization
- 🏙️ Smart city traffic & metro integration
- 🎟️ Integration with ticketing platforms

---

## 👨‍💻 Team
**Jayani Trivedi**  
*FlowSync AI • 2026*

---

## ⭐ Support
If you found this project interesting:
- 👉 Star the repo
- 👉 Share feedback
- 👉 Fork & build on it

> **⚡ FlowSync AI doesn’t just manage crowds — it predicts and orchestrates them.**
