/**
 * firestore-setup.js
 * Firebase Admin SDK + Firestore integration for FlowSync AI.
 *
 * In local dev without a service-account key, we fall back to
 * the static mock snapshot so the app still works offline / in CI.
 *
 * In Cloud Run the SDK picks up ADC (Application Default Credentials)
 * automatically — no key file needed.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ── Initialise Firebase Admin (idempotent) ───────────────────────────────────
let db = null;

function initAdmin() {
  if (db) return db;
  try {
    if (!getApps().length) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // Cloud Run: JSON key injected via Secret Manager env var
        const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        initializeApp({ credential: cert(sa) });
      } else {
        // Local dev: ADC or GOOGLE_APPLICATION_CREDENTIALS file
        initializeApp();
      }
    }
    db = getFirestore();
    db.settings({ ignoreUndefinedProperties: true });
    console.log(JSON.stringify({ severity: 'INFO', message: 'Firestore Admin SDK initialised' }));
    return db;
  } catch (err) {
    console.warn(JSON.stringify({
      severity: 'WARNING',
      message: `Firestore init failed — using mock data. Reason: ${err.message}`,
    }));
    return null;
  }
}

// ── Static fallback snapshot (used when Firestore is unavailable) ────────────
const MOCK_ZONES = [
  { zone: 'Entrance Gate A',  density: 'High',   occupancy: 920,  capacity: 1000, lat: 0.85, lng: 0.20, wait: 12, trend: 'rising'  },
  { zone: 'Entrance Gate B',  density: 'Low',    occupancy: 180,  capacity: 1000, lat: 0.85, lng: 0.80, wait: 2,  trend: 'stable'  },
  { zone: 'Entrance Gate C',  density: 'Medium', occupancy: 540,  capacity: 800,  lat: 0.15, lng: 0.50, wait: 5,  trend: 'falling' },
  { zone: 'Food Court Main',  density: 'Medium', occupancy: 460,  capacity: 600,  lat: 0.50, lng: 0.60, wait: 15, trend: 'rising'  },
  { zone: 'Food Court West',  density: 'Low',    occupancy: 120,  capacity: 400,  lat: 0.50, lng: 0.25, wait: 4,  trend: 'stable'  },
  { zone: 'Main Stage',       density: 'Low',    occupancy: 2200, capacity: 5000, lat: 0.50, lng: 0.50, wait: 0,  trend: 'stable'  },
  { zone: 'Restrooms North',  density: 'High',   occupancy: 145,  capacity: 150,  lat: 0.20, lng: 0.65, wait: 8,  trend: 'rising'  },
  { zone: 'Restrooms South',  density: 'Low',    occupancy: 30,   capacity: 150,  lat: 0.80, lng: 0.65, wait: 1,  trend: 'stable'  },
  { zone: 'Merchandise Tent', density: 'Medium', occupancy: 310,  capacity: 400,  lat: 0.35, lng: 0.80, wait: 5,  trend: 'falling' },
  { zone: 'First Aid Station',density: 'Low',    occupancy: 10,   capacity: 50,   lat: 0.20, lng: 0.35, wait: 0,  trend: 'stable'  },
];

const MOCK_WAIT_TIMES = [
  { service: 'Food Stand 1',     estimatedWaitMinutes: 15, zone: 'Food Court Main',  trend: 'rising'  },
  { service: 'Food Stand 2',     estimatedWaitMinutes: 4,  zone: 'Food Court West',  trend: 'stable'  },
  { service: 'Restroom North',   estimatedWaitMinutes: 8,  zone: 'Restrooms North',  trend: 'rising'  },
  { service: 'Restroom South',   estimatedWaitMinutes: 1,  zone: 'Restrooms South',  trend: 'stable'  },
  { service: 'Merchandise Tent', estimatedWaitMinutes: 5,  zone: 'Merchandise Tent', trend: 'falling' },
  { service: 'Ticketing Desk',   estimatedWaitMinutes: 20, zone: 'Entrance Gate A',  trend: 'rising'  },
];

/** Returns static mock snapshot (always safe to call) */
export const getMockSnapshot = () => ({
  crowdData: MOCK_ZONES,
  waitTimes: MOCK_WAIT_TIMES,
  totalAttendees: MOCK_ZONES.reduce((s, z) => s + z.occupancy, 0),
  activeAlerts: MOCK_ZONES.filter(z => z.density === 'High').length,
  updatedAt: new Date().toISOString(),
  source: 'mock',
});

/**
 * Reads live crowd data from Firestore.
 * Falls back to mock if Firestore is unavailable.
 */
export const getVenueSnapshot = async () => {
  const firestore = initAdmin();
  if (!firestore) return getMockSnapshot();

  try {
    const zonesSnap = await firestore
      .collection('venues').doc('stadium-1').collection('zones')
      .orderBy('zone')
      .get();

    if (zonesSnap.empty) {
      // Seed initial data on first boot
      await seedZones(firestore);
      return getMockSnapshot();
    }

    const crowdData = zonesSnap.docs.map(d => d.data());
    const waitTimes = crowdData
      .filter(z => z.service)
      .map(z => ({ service: z.service, estimatedWaitMinutes: z.wait || 0, zone: z.zone, trend: z.trend || 'stable' }));

    return {
      crowdData,
      waitTimes: waitTimes.length ? waitTimes : MOCK_WAIT_TIMES,
      totalAttendees: crowdData.reduce((s, z) => s + (z.occupancy || 0), 0),
      activeAlerts: crowdData.filter(z => z.density === 'High').length,
      updatedAt: new Date().toISOString(),
      source: 'firestore',
    };
  } catch (err) {
    console.error(JSON.stringify({ severity: 'ERROR', message: `Firestore read failed: ${err.message}` }));
    return getMockSnapshot();
  }
};

/**
 * Writes an order to Firestore.
 */
export const writeOrder = async (order) => {
  const firestore = initAdmin();
  if (!firestore) return false;
  try {
    await firestore.collection('orders').doc(order.orderId).set(order);
    return true;
  } catch (err) {
    console.error(JSON.stringify({ severity: 'ERROR', message: `Order write failed: ${err.message}` }));
    return false;
  }
};

/**
 * Reads a single order from Firestore.
 */
export const readOrder = async (orderId) => {
  const firestore = initAdmin();
  if (!firestore) return null;
  try {
    const doc = await firestore.collection('orders').doc(orderId).get();
    return doc.exists ? doc.data() : null;
  } catch {
    return null;
  }
};

/**
 * Updates an order field in Firestore.
 */
export const updateOrderStatus = async (orderId, status) => {
  const firestore = initAdmin();
  if (!firestore) return false;
  try {
    await firestore.collection('orders').doc(orderId).update({
      status,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Lists orders by userId from Firestore.
 */
export const listOrders = async (userId) => {
  const firestore = initAdmin();
  if (!firestore) return [];
  try {
    let q = firestore.collection('orders').orderBy('placedAt', 'desc').limit(50);
    if (userId) q = firestore.collection('orders').where('userId', '==', userId).orderBy('placedAt', 'desc');
    const snap = await q.get();
    return snap.docs.map(d => d.data());
  } catch {
    return [];
  }
};

/**
 * Writes an alert to Firestore (all clients listening will receive it instantly).
 */
export const writeAlert = async (alert) => {
  const firestore = initAdmin();
  if (!firestore) return false;
  try {
    await firestore.collection('alerts').add({
      ...alert,
      createdAt: FieldValue.serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Updates all zone documents in Firestore with simulated live data.
 * Called by the crowd event engine every 15 seconds.
 */
export const updateZones = async (zones) => {
  const firestore = initAdmin();
  if (!firestore) return;
  const batch = firestore.batch();
  const coll = firestore.collection('venues').doc('stadium-1').collection('zones');
  zones.forEach(z => {
    const ref = coll.doc(z.zone.replace(/\s+/g, '-').toLowerCase());
    batch.set(ref, { ...z, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
  await batch.commit();
};

// ── Seed helper ───────────────────────────────────────────────────────────────
async function seedZones(firestore) {
  console.log(JSON.stringify({ severity: 'INFO', message: 'Seeding initial zone data into Firestore' }));
  const batch = firestore.batch();
  const coll = firestore.collection('venues').doc('stadium-1').collection('zones');
  MOCK_ZONES.forEach(z => {
    const ref = coll.doc(z.zone.replace(/\s+/g, '-').toLowerCase());
    batch.set(ref, { ...z, updatedAt: FieldValue.serverTimestamp() });
  });
  await batch.commit();
}

export { initAdmin };
