import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './api/routes.js';
import { startCrowdEngine } from './crowd-engine.js';

dotenv.config();

const app = express();

// ── Cloud Run: use the PORT env var (default 8080) ──────
const PORT = process.env.PORT || 8080;

// ── Security: basic headers ──────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// ── CORS: allow frontend origins ─────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, true); // open during hackathon demo
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

// ── Structured logging (Cloud Logging compatible) ────────
app.use((req, _res, next) => {
  console.log(JSON.stringify({
    severity: 'INFO',
    message: `${req.method} ${req.path}`,
    httpRequest: { method: req.method, requestUrl: req.originalUrl },
    timestamp: new Date().toISOString(),
  }));
  next();
});

// ── Routes ───────────────────────────────────────────────
app.use('/api', apiRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FlowSync AI Backend',
    region: process.env.CLOUD_RUN_REGION || 'local',
    timestamp: new Date().toISOString(),
  });
});

// ── Serve React Frontend (Single Container Architecture) ─
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(JSON.stringify({
      severity: 'INFO',
      message: `FlowSync AI backend running on port ${PORT}`,
      timestamp: new Date().toISOString(),
    }));
    // Start the simulated crowd event engine
    // Writes to Firestore every 15 s — all clients update in real time
    startCrowdEngine();
  });
}

export default app;
