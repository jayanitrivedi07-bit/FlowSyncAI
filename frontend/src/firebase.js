/**
 * firebase.js — FlowSync AI Firebase Client SDK
 *
 * Replace the firebaseConfig values with your own from:
 * Firebase Console → Project Settings → Your apps → SDK setup
 *
 * For the hackathon demo, these placeholders allow the app to
 * run in offline/mock mode even without a real Firebase project.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'demo-api-key',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'flowsync-demo.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'flowsync-demo',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'flowsync-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:000000000000:web:demo',
};

// Initialise once (safe for HMR / strict mode)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence (Firestore queues writes when offline, replays on reconnect)
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence can only be enabled in one tab at a time
    console.warn('[Firebase] Persistence unavailable: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('[Firebase] Persistence not supported in this browser');
  }
});

export default app;
