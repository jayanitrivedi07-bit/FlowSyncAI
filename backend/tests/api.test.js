/**
 * FlowSync AI — API Unit Tests
 *
 * Strategy: mock all external dependencies (Firebase, Gemini, crowd-engine)
 * so tests run fast, offline, and without any cloud credentials.
 * NODE_ENV=test already prevents the server from starting crowd-engine.
 */

import { jest } from '@jest/globals';

// ── Mock firebase-admin before any import resolves it ────────────────────────
jest.unstable_mockModule('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn(),
}));

jest.unstable_mockModule('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => null),
  FieldValue: { serverTimestamp: jest.fn(() => new Date().toISOString()) },
}));

// ── Mock crowd-engine so it never dials Firestore ────────────────────────────
jest.unstable_mockModule('../crowd-engine.js', () => ({
  startCrowdEngine: jest.fn(),
}));

// ── Mock agents so no Gemini key is needed ───────────────────────────────────
jest.unstable_mockModule('../agents/index.js', () => ({
  runAgent: jest.fn(async () => 'Mock AI response for testing'),
}));

// ── Mock firestore-service to return deterministic mock data ─────────────────
jest.unstable_mockModule('../firestore-service.js', () => ({
  getVenueSnapshot: jest.fn(async () => ({
    crowdData: [
      { zone: 'Gate A', density: 'High',   occupancy: 920, capacity: 1000, lat: 0.85, lng: 0.20, wait: 12, trend: 'rising' },
      { zone: 'Gate B', density: 'Low',    occupancy: 180, capacity: 1000, lat: 0.85, lng: 0.80, wait: 2,  trend: 'stable' },
      { zone: 'Gate C', density: 'Medium', occupancy: 540, capacity: 800,  lat: 0.15, lng: 0.50, wait: 5,  trend: 'falling' },
    ],
    waitTimes: [{ service: 'Food Stand', estimatedWaitMinutes: 10, zone: 'Food Court', trend: 'rising' }],
    totalAttendees: 1640,
    activeAlerts: 1,
    updatedAt: new Date().toISOString(),
    source: 'mock',
  })),
  getMockSnapshot: jest.fn(() => ({
    crowdData: [
      { zone: 'Gate A', density: 'High', occupancy: 920, capacity: 1000, lat: 0.85, lng: 0.20, wait: 12, trend: 'rising' },
    ],
    waitTimes: [],
    totalAttendees: 920,
    activeAlerts: 1,
    updatedAt: new Date().toISOString(),
    source: 'mock',
  })),
  writeOrder: jest.fn(async () => true),
  readOrder: jest.fn(async () => null),
  updateOrderStatus: jest.fn(async () => true),
  listOrders: jest.fn(async () => []),
  writeAlert: jest.fn(async () => true),
}));

// ── Dynamic import after all mocks are registered ────────────────────────────
const { default: request } = await import('supertest');
const { default: app }     = await import('../server.js');

// ── Test suite ────────────────────────────────────────────────────────────────
describe('FlowSync AI — Core API Tests', () => {

  // ── /health ────────────────────────────────────────────────────────────────
  describe('GET /health', () => {
    test('returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    test('response includes service name and timestamp', async () => {
      const res = await request(app).get('/health');
      expect(res.body).toHaveProperty('service');
      expect(res.body).toHaveProperty('timestamp');
      expect(typeof res.body.timestamp).toBe('string');
    });

    test('service name identifies FlowSync AI', async () => {
      const res = await request(app).get('/health');
      expect(res.body.service).toMatch(/FlowSync/i);
    });
  });

  // ── /api/crowd ─────────────────────────────────────────────────────────────
  describe('GET /api/crowd', () => {
    test('returns 200 with success flag', async () => {
      const res = await request(app).get('/api/crowd');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('data is an array of zone objects', async () => {
      const res = await request(app).get('/api/crowd');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('each zone has required fields', async () => {
      const res = await request(app).get('/api/crowd');
      const zone = res.body.data[0];
      expect(zone).toHaveProperty('zone');
      expect(zone).toHaveProperty('density');
      expect(zone).toHaveProperty('occupancy');
      expect(zone).toHaveProperty('capacity');
    });

    test('response includes source field (firestore or mock)', async () => {
      const res = await request(app).get('/api/crowd');
      expect(res.body).toHaveProperty('source');
      expect(['firestore', 'mock', 'mock-fallback']).toContain(res.body.source);
    });

    test('response includes ISO timestamp', async () => {
      const res = await request(app).get('/api/crowd');
      expect(res.body).toHaveProperty('timestamp');
      expect(new Date(res.body.timestamp).getTime()).not.toBeNaN();
    });
  });

  // ── /api/gates ─────────────────────────────────────────────────────────────
  describe('GET /api/gates', () => {
    test('returns 200 with success flag', async () => {
      const res = await request(app).get('/api/gates');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('data contains exactly 4 gates (A, B, C, D)', async () => {
      const res = await request(app).get('/api/gates');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(4);
    });

    test('recommendedGate is one of A, B, C, D', async () => {
      const res = await request(app).get('/api/gates');
      expect(['A', 'B', 'C', 'D']).toContain(res.body.recommendedGate);
    });

    test('each gate has id, wait, occupancy, capacity and status', async () => {
      const res = await request(app).get('/api/gates');
      res.body.data.forEach(gate => {
        expect(gate).toHaveProperty('id');
        expect(gate).toHaveProperty('wait');
        expect(gate).toHaveProperty('occupancy');
        expect(gate).toHaveProperty('capacity');
        expect(gate).toHaveProperty('status');
      });
    });

    test('gate status values are High, Medium, or Low', async () => {
      const res = await request(app).get('/api/gates');
      res.body.data.forEach(gate => {
        expect(['High', 'Medium', 'Low']).toContain(gate.status);
      });
    });

    test('tip field provides a human-readable recommendation', async () => {
      const res = await request(app).get('/api/gates');
      expect(res.body).toHaveProperty('tip');
      expect(typeof res.body.tip).toBe('string');
      expect(res.body.tip.length).toBeGreaterThan(10);
    });
  });

  // ── /api/stats ─────────────────────────────────────────────────────────────
  describe('GET /api/stats', () => {
    test('returns 200 with venue KPIs', async () => {
      const res = await request(app).get('/api/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalCrowd');
      expect(res.body.data).toHaveProperty('highDensityZones');
      expect(res.body.data).toHaveProperty('safetyStatus');
    });

    test('safetyStatus is NORMAL or CAUTION', async () => {
      const res = await request(app).get('/api/stats');
      expect(['NORMAL', 'CAUTION']).toContain(res.body.data.safetyStatus);
    });
  });

});
