/**
 * crowd-engine.js
 *
 * Simulated Real-Time Crowd Event Engine
 * ──────────────────────────────────────
 * Runs inside the Cloud Run instance. Every 15 seconds it:
 *  1. Slightly mutates each zone's occupancy (±5 pax realistic drift)
 *  2. Recalculates density levels
 *  3. Writes the updated snapshot to Firestore
 *
 * All frontend clients subscribed via onSnapshot() will receive
 * the update automatically — zero polling required.
 *
 * For the hackathon demo, simulate() can also be called directly
 * from the /api/simulate route to trigger dramatic crowd spikes.
 */

import { getMockSnapshot, updateZones, writeAlert } from './firestore-service.js';

const TICK_MS = 15_000; // 15 s between ticks

// Working copy of zone state (seeded from mock on startup)
let zones = getMockSnapshot().crowdData.map(z => ({ ...z }));

/** Drift a number ±delta, clamped between min and max */
const drift = (val, delta, min, max) =>
  Math.min(max, Math.max(min, val + Math.round((Math.random() * 2 - 1) * delta)));

/** Map occupancy % to density label */
const toDensity = (occ, cap) => {
  const pct = (occ / cap) * 100;
  if (pct >= 80) return 'High';
  if (pct >= 45) return 'Medium';
  return 'Low';
};

/** Gently mutate all zone occupancy values (normal operation) */
function tick() {
  zones = zones.map(z => {
    const newOcc     = drift(z.occupancy, 30, 0, z.capacity);
    const newWait    = drift(z.wait || 0, 2, 0, 60);
    const newDensity = toDensity(newOcc, z.capacity);
    const trends     = ['rising', 'stable', 'falling'];
    const trend      = trends[Math.floor(Math.random() * 3)];
    return { ...z, occupancy: newOcc, wait: newWait, density: newDensity, trend };
  });

  updateZones(zones).catch(err => {
    console.error(JSON.stringify({ severity: 'ERROR', message: `Crowd engine write failed: ${err.message}` }));
  });
}

/**
 * Simulate a dramatic crowd event (goal, halftime, match_end, emergency).
 * Immediately updates Firestore so all frontend clients react in real time.
 *
 * @param {string} event - one of: goal | halftime | match_end | emergency
 */
export async function simulateEvent(event) {
  let alertMsg = '';

  switch (event) {
    case 'goal':
      // Spike Food Court + Restrooms after a goal celebration
      zones = zones.map(z => {
        if (z.zone.includes('Food Court Main'))  return { ...z, occupancy: Math.min(z.capacity, z.occupancy + 180), density: 'High', wait: 20 };
        if (z.zone.includes('Restrooms North'))  return { ...z, occupancy: z.capacity, density: 'High', wait: 15 };
        if (z.zone.includes('Entrance Gate A'))  return { ...z, occupancy: Math.max(0, z.occupancy - 150), density: 'Low', wait: 2 };
        return z;
      });
      alertMsg = '⚽ GOAL! Food Court & Restrooms spiking — redirecting crowd to West alternatives.';
      break;

    case 'halftime':
      // All services spike simultaneously
      zones = zones.map(z => {
        if (z.zone.includes('Food Court'))  return { ...z, occupancy: Math.min(z.capacity, Math.round(z.capacity * 0.95)), density: 'High', wait: 18 };
        if (z.zone.includes('Restroom'))    return { ...z, occupancy: Math.min(z.capacity, Math.round(z.capacity * 0.97)), density: 'High', wait: 12 };
        if (z.zone.includes('Merchandise')) return { ...z, occupancy: Math.min(z.capacity, Math.round(z.capacity * 0.85)), density: 'High', wait: 10 };
        return z;
      });
      alertMsg = '⏸ HALFTIME — All services at high load. Routing users to least-congested alternatives.';
      break;

    case 'match_end':
      // Gate A overwhelmed; route users to B, C, D
      zones = zones.map(z => {
        if (z.zone.includes('Gate A')) return { ...z, occupancy: z.capacity, density: 'High', wait: 25 };
        if (z.zone.includes('Gate B')) return { ...z, occupancy: Math.round(z.capacity * 0.6), density: 'Medium', wait: 8 };
        if (z.zone.includes('Food Court')) return { ...z, occupancy: Math.round(z.capacity * 0.2), density: 'Low', wait: 2 };
        return z;
      });
      alertMsg = '🏆 MATCH END — Gate A at max capacity. Using Gates B, C, D overflow protocol.';
      break;

    case 'emergency':
      // Clear exit zones, spike staging area
      zones = zones.map(z => {
        if (z.zone.includes('Gate'))        return { ...z, occupancy: Math.round(z.capacity * 0.7), density: 'Medium', wait: 5 };
        if (z.zone.includes('First Aid'))   return { ...z, occupancy: Math.round(z.capacity * 0.9), density: 'High', wait: 0 };
        return z;
      });
      alertMsg = '🚨 EMERGENCY DRILL — Stadium evacuation protocol ACTIVE. Follow green exit signs.';
      break;

    default:
      console.warn(`Unknown event: ${event}`);
      return;
  }

  // Persist to Firestore immediately
  await Promise.all([
    updateZones(zones),
    writeAlert({ severity: 'CRITICAL', message: alertMsg, event, timestamp: new Date().toISOString() }),
  ]);

  console.log(JSON.stringify({ severity: 'INFO', message: `Crowd engine: simulated ${event}` }));
}

/**
 * Starts the background crowd engine ticking.
 * Called once at server startup.
 */
export function startCrowdEngine() {
  console.log(JSON.stringify({
    severity: 'INFO',
    message: `Crowd engine started — ticking every ${TICK_MS / 1000}s`,
  }));

  // Initial tick on startup to seed/refresh Firestore
  tick();

  // Recurring ticks
  const interval = setInterval(tick, TICK_MS);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    clearInterval(interval);
    console.log(JSON.stringify({ severity: 'INFO', message: 'Crowd engine stopped (SIGTERM)' }));
  });
}
