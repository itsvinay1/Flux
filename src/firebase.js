import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCHd2jNiUEInS9cot_AMBsi6cAHkJsu-XU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "flux-9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "flux-9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "flux-9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "984328987655",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:984328987655:web:1d849fa847cbe3228e76a2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-08DLTS4PK7"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configure Local Session Persistence for reliable token retention across reloads
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('[Firebase Auth] Persistence configuration notice:', err);
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firebase Remote Config with default fallback parameters
export const remoteConfig = getRemoteConfig(app);
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour fetch interval
remoteConfig.defaultConfig = {
  daily_hype_banner: "Crush your goals today!",
  streak_multiplier: 1,
  featured_goal_category: "productivity",
};

// Background fetch and activate remote config values
fetchAndActivate(remoteConfig)
  .then((activated) => {
    console.log(`[Firebase Remote Config] Config fetched & activated (New changes: ${activated})`);
  })
  .catch((err) => {
    console.warn('[Firebase Remote Config] Fetch skipped, using default config:', err);
  });

// Helper function to safely retrieve remote config string parameter
export function getRemoteString(key) {
  try {
    const val = getValue(remoteConfig, key).asString();
    return String(val || '').slice(0, 200);
  } catch (e) {
    const fallback = remoteConfig.defaultConfig[key] || '';
    return String(fallback).slice(0, 200);
  }
}

// Initialize Firebase Analytics safely (checks browser compatibility and user consent)
export let analytics = null;
const hasConsent = localStorage.getItem('flux-analytics-consent') === 'true';

if (hasConsent) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Enable Offline IndexedDB Persistence for zero-latency performance
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('[Firebase] Multiple tabs open, persistence enabled in primary tab.');
    } else if (err.code === 'unimplemented') {
      console.warn('[Firebase] Browser does not support offline persistence.');
    }
  });
} catch (e) {
  console.warn('[Firebase] Persistence init skipped.');
}

export default app;
