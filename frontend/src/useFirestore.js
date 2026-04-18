/**
 * useFirestore.js — Real-time Firestore hooks for FlowSync AI
 *
 * All hooks use onSnapshot() — Firestore pushes updates to the
 * browser instantly when backend writes change any document.
 * No polling, no stale data, consistent across all devices.
 */

import { useState, useEffect } from 'react';
import {
  collection, doc, onSnapshot,
  query, orderBy, limit, where,
} from 'firebase/firestore';
import { db } from './firebase.js';

// ─────────────────────────────────────────────────────────
// useCrowdZones — real-time zone density data
// Listens to: venues/stadium-1/zones (all documents)
// Falls back to empty array if Firestore is unavailable.
// ─────────────────────────────────────────────────────────
export function useCrowdZones() {
  const [zones, setZones]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const zonesRef = collection(db, 'venues', 'stadium-1', 'zones');

    const unsub = onSnapshot(
      zonesRef,
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setZones(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('[useCrowdZones] Firestore error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const highCount   = zones.filter(z => z.density === 'High').length;
  const totalPax    = zones.reduce((s, z) => s + (z.occupancy || 0), 0);
  const safetyStatus = highCount >= 2 ? 'CAUTION' : 'NORMAL';

  return { zones, loading, error, highCount, totalPax, safetyStatus };
}

// ─────────────────────────────────────────────────────────
// useOrderStatus — real-time single order listener
// Listens to: orders/{orderId}
// ─────────────────────────────────────────────────────────
export function useOrderStatus(orderId) {
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }

    const ref   = doc(db, 'orders', orderId.toUpperCase());
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setOrder(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [orderId]);

  return { order, loading };
}

// ─────────────────────────────────────────────────────────
// useUserOrders — real-time list of orders for a userId
// Listens to: orders where userId == uid, latest 10
// ─────────────────────────────────────────────────────────
export function useUserOrders(userId) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setOrders([]); setLoading(false); return; }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('placedAt', 'desc'),
      limit(10)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map(d => d.data()));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [userId]);

  return { orders, loading };
}

// ─────────────────────────────────────────────────────────
// useAlerts — real-time latest alerts feed
// Listens to: alerts (latest 15, ordered by createdAt desc)
// ─────────────────────────────────────────────────────────
export function useAlerts() {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'alerts'),
      orderBy('createdAt', 'desc'),
      limit(15)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.warn('[useAlerts] Firestore error:', err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { alerts, loading };
}

// ─────────────────────────────────────────────────────────
// useVenueStats — derived KPIs from live zone data
// No extra Firestore subscription — computed from useCrowdZones
// ─────────────────────────────────────────────────────────
export function useVenueStats() {
  const { zones, loading, highCount, totalPax, safetyStatus } = useCrowdZones();

  const avgWait = zones.length
    ? Math.round(zones.reduce((s, z) => s + (z.wait || 0), 0) / zones.length)
    : 0;

  return {
    loading,
    totalCrowd:       totalPax.toLocaleString(),
    highDensityZones: highCount,
    avgWaitMinutes:   `${avgWait} min`,
    activeAlerts:     highCount,
    safetyStatus,
  };
}
