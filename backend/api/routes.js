import express from 'express';
import { runAgent } from '../agents/index.js';
import { getVenueSnapshot } from '../../firebase/firestore-setup.js';

const router = express.Router();

/* ─────────────────────────────────────────────
   GET /api/crowd  – current crowd density data
───────────────────────────────────────────── */
router.get('/crowd', (req, res) => {
  const snap = getVenueSnapshot();
  res.json({ success: true, timestamp: new Date().toISOString(), data: snap.crowdData });
});

/* ─────────────────────────────────────────────
   GET /api/wait-times  – current service queues
───────────────────────────────────────────── */
router.get('/wait-times', (req, res) => {
  const snap = getVenueSnapshot();
  res.json({ success: true, timestamp: new Date().toISOString(), data: snap.waitTimes });
});

/* ─────────────────────────────────────────────
   GET /api/stats  – venue-wide summary KPIs
───────────────────────────────────────────── */
router.get('/stats', (req, res) => {
  const snap = getVenueSnapshot();
  const high = snap.crowdData.filter(z => z.density === 'High').length;
  const avgWait = Math.round(
    snap.waitTimes.reduce((a, s) => a + s.estimatedWaitMinutes, 0) / snap.waitTimes.length
  );
  res.json({
    success: true,
    data: {
      totalCrowd: snap.totalAttendees,
      highDensityZones: high,
      avgWaitMinutes: avgWait,
      activeAlerts: snap.activeAlerts,
      safetyStatus: high >= 2 ? 'CAUTION' : 'NORMAL',
    }
  });
});

/* ─────────────────────────────────────────────
   POST /api/predict  – run a specific AI agent
   Body: { agentType, query }
───────────────────────────────────────────── */
router.post('/predict', async (req, res) => {
  const { agentType, query } = req.body;

  const validAgents = [
    'crowdPredictionAgent',
    'queueOptimizationAgent',
    'userGuidanceAgent',
    'adminAlertAgent',
    'emergencyResponseAgent',
  ];

  if (!agentType || !validAgents.includes(agentType)) {
    return res.status(400).json({
      success: false,
      error: `agentType must be one of: ${validAgents.join(', ')}`,
    });
  }

  const snap = getVenueSnapshot();
  const result = await runAgent(agentType, snap, query);

  res.json({ success: true, agent: agentType, timestamp: new Date().toISOString(), result });
});

/* ─────────────────────────────────────────────
   POST /api/simulate  – trigger event simulation
   Body: { event: 'goal' | 'halftime' | 'match_end' }
───────────────────────────────────────────── */
router.post('/simulate', async (req, res) => {
  const { event } = req.body;
  const snap = getVenueSnapshot();
  const result = await runAgent('adminAlertAgent', snap, `Simulate crowd response for event: ${event}`);
  res.json({ success: true, event, agentResponse: result, timestamp: new Date().toISOString() });
});

export default router;
