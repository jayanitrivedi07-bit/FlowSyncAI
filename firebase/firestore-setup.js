/**
 * firestore-setup.js
 * Provides simulated venue snapshot data.
 * In production, replace these functions with live Firestore reads/writes.
 */

// ──────────────────────────────────────────────────
// Simulated crowd data (mirrors Firestore docs)
// ──────────────────────────────────────────────────
const crowdData = [
  { zone: 'Entrance Gate A', density: 'High',   occupancy: 920,  capacity: 1000, lat: 0.85, lng: 0.20 },
  { zone: 'Entrance Gate B', density: 'Low',    occupancy: 180,  capacity: 1000, lat: 0.85, lng: 0.80 },
  { zone: 'Entrance Gate C', density: 'Medium', occupancy: 540,  capacity: 800,  lat: 0.15, lng: 0.50 },
  { zone: 'Food Court Main', density: 'Medium', occupancy: 460,  capacity: 600,  lat: 0.50, lng: 0.60 },
  { zone: 'Food Court West', density: 'Low',    occupancy: 120,  capacity: 400,  lat: 0.50, lng: 0.25 },
  { zone: 'Main Stage',      density: 'Low',    occupancy: 2200, capacity: 5000, lat: 0.50, lng: 0.50 },
  { zone: 'Restrooms North', density: 'High',   occupancy: 145,  capacity: 150,  lat: 0.20, lng: 0.65 },
  { zone: 'Restrooms South', density: 'Low',    occupancy: 30,   capacity: 150,  lat: 0.80, lng: 0.65 },
  { zone: 'Merchandise Tent',density: 'Medium', occupancy: 310,  capacity: 400,  lat: 0.35, lng: 0.80 },
  { zone: 'First Aid Station',density:'Low',    occupancy: 10,   capacity: 50,   lat: 0.20, lng: 0.35 },
];

const waitTimes = [
  { service: 'Food Stand 1',     estimatedWaitMinutes: 15, zone: 'Food Court Main', trend: 'rising'  },
  { service: 'Food Stand 2',     estimatedWaitMinutes: 4,  zone: 'Food Court West', trend: 'stable'  },
  { service: 'Restroom North',   estimatedWaitMinutes: 8,  zone: 'Restrooms North', trend: 'rising'  },
  { service: 'Restroom South',   estimatedWaitMinutes: 1,  zone: 'Restrooms South', trend: 'stable'  },
  { service: 'Merchandise Tent', estimatedWaitMinutes: 5,  zone: 'Merchandise Tent',trend: 'falling' },
  { service: 'Ticketing Desk',   estimatedWaitMinutes: 20, zone: 'Entrance Gate A', trend: 'rising'  },
];

/**
 * Returns a full venue snapshot – used by API routes and agents
 */
export const getVenueSnapshot = () => ({
  crowdData,
  waitTimes,
  totalAttendees: crowdData.reduce((sum, z) => sum + z.occupancy, 0),
  activeAlerts: crowdData.filter(z => z.density === 'High').length,
  updatedAt: new Date().toISOString(),
});

/**
 * Utility: console-logs the snapshot (run as standalone script)
 */
export const initializeMockData = () => {
  const snap = getVenueSnapshot();
  console.log('📦 Firebase Venue Snapshot initialised:');
  console.log(`   Zones: ${snap.crowdData.length} | Attendees: ${snap.totalAttendees} | Alerts: ${snap.activeAlerts}`);
  return snap;
};
