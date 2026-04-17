import express from 'express';
import { runAgent } from '../agents/index.js';
import { getVenueSnapshot } from '../../firebase/firestore-setup.js';

const router = express.Router();

/* ─────────────────────────────────────────────
   In-memory order store (replaces Firestore for
   local dev; swap with Firestore writes in prod)
───────────────────────────────────────────── */
const ordersStore = new Map(); // orderId → order

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
   GET /api/gates  – live gate wait times + AI
   recommendation for least-crowded gate
───────────────────────────────────────────── */
router.get('/gates', (req, res) => {
  const gates = [
    { id: 'A', name: 'Gate A — North Entrance', wait: Math.max(1, Math.round(10 + (Math.random() * 6 - 3))), occupancy: Math.round(900 + (Math.random() * 60 - 30)), capacity: 1000, sector: 'Block A1-A10', distance: '3 min walk' },
    { id: 'B', name: 'Gate B — East Entrance',  wait: Math.max(1, Math.round(2  + (Math.random() * 4 - 2))), occupancy: Math.round(180 + (Math.random() * 60 - 30)), capacity: 1000, sector: 'Block B1-B10', distance: '5 min walk' },
    { id: 'C', name: 'Gate C — South Entrance', wait: Math.max(1, Math.round(5  + (Math.random() * 4 - 2))), occupancy: Math.round(540 + (Math.random() * 60 - 30)), capacity: 800,  sector: 'Block C1-C8',  distance: '7 min walk' },
    { id: 'D', name: 'Gate D — West Entrance',  wait: Math.max(1, Math.round(1  + (Math.random() * 3 - 1))), occupancy: Math.round(90  + (Math.random() * 40 - 20)), capacity: 600,  sector: 'Block D1-D6',  distance: '4 min walk' },
  ].map(g => ({
    ...g,
    status: (g.occupancy / g.capacity) > 0.8 ? 'High' : (g.occupancy / g.capacity) > 0.5 ? 'Medium' : 'Low',
  }));

  const recommended = gates.reduce((best, g) => g.wait < best.wait ? g : best, gates[0]);

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: gates,
    recommendedGate: recommended.id,
    tip: `Gate ${recommended.id} has the shortest wait (${recommended.wait} min). Save ${Math.max(...gates.map(g => g.wait)) - recommended.wait} min vs busiest gate.`,
  });
});

/* ─────────────────────────────────────────────
   POST /api/orders  – place a new food order
   Body: { userId, stallId, stallName, items: [{itemId, name, price, qty}] }
───────────────────────────────────────────── */
router.post('/orders', (req, res) => {
  const { userId = 'guest', stallId, stallName, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'items array is required and must not be empty' });
  }

  const orderId = Math.random().toString(36).slice(2, 8).toUpperCase();
  const total   = items.reduce((s, it) => s + it.price * it.qty, 0);

  const order = {
    orderId,
    userId,
    stallId,
    stallName,
    items,
    total,
    status:    'placed',    // placed | confirmed | preparing | ready | collected
    placedAt:  new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedReadyMinutes: Math.round(5 + Math.random() * 10),
  };

  ordersStore.set(orderId, order);

  // Simulate status progression
  const progressions = [
    { status: 'confirmed', delay: 3000  },
    { status: 'preparing', delay: 8000  },
    { status: 'ready',     delay: 20000 },
  ];
  progressions.forEach(({ status, delay }) => {
    setTimeout(() => {
      const o = ordersStore.get(orderId);
      if (o) ordersStore.set(orderId, { ...o, status, updatedAt: new Date().toISOString() });
    }, delay);
  });

  res.status(201).json({ success: true, order });
});

/* ─────────────────────────────────────────────
   GET /api/orders/:orderId  – poll order status
───────────────────────────────────────────── */
router.get('/orders/:orderId', (req, res) => {
  const order = ordersStore.get(req.params.orderId.toUpperCase());
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order });
});

/* ─────────────────────────────────────────────
   PATCH /api/orders/:orderId  – update status
   Body: { status: 'collected' }
───────────────────────────────────────────── */
router.patch('/orders/:orderId', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['placed', 'confirmed', 'preparing', 'ready', 'collected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const order = ordersStore.get(req.params.orderId.toUpperCase());
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const updated = { ...order, status, updatedAt: new Date().toISOString() };
  ordersStore.set(req.params.orderId.toUpperCase(), updated);
  res.json({ success: true, order: updated });
});

/* ─────────────────────────────────────────────
   GET /api/orders  – list orders (by userId)
   Query: ?userId=xxx
───────────────────────────────────────────── */
router.get('/orders', (req, res) => {
  const { userId } = req.query;
  const all = [...ordersStore.values()];
  const filtered = userId ? all.filter(o => o.userId === userId) : all;
  res.json({ success: true, count: filtered.length, orders: filtered.sort((a, b) => b.placedAt.localeCompare(a.placedAt)) });
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
   Body: { event: 'goal' | 'halftime' | 'match_end' | 'emergency' }
───────────────────────────────────────────── */
router.post('/simulate', async (req, res) => {
  const { event } = req.body;
  const snap = getVenueSnapshot();
  const result = await runAgent('adminAlertAgent', snap, `Simulate crowd response for event: ${event}`);
  res.json({ success: true, event, agentResponse: result, timestamp: new Date().toISOString() });
});

/* ─────────────────────────────────────────────
   POST /api/alerts  – broadcast alert to users
   Body: { severity, message }
───────────────────────────────────────────── */
router.post('/alerts', (req, res) => {
  const { severity = 'INFO', message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: 'message is required' });
  }
  const alert = {
    id:        Date.now(),
    severity:  severity.toUpperCase(),
    message,
    timestamp: new Date().toISOString(),
  };
  // In prod: write to Firestore & push via FCM / SSE
  res.status(201).json({ success: true, alert, note: 'Alert would be pushed via FCM in production' });
});

export default router;
