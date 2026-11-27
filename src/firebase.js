import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';

// All config values MUST come from environment variables.
// Never add || "hardcoded-fallback" here — doing so leaks credentials into the bundle.
// Copy .env.example to .env and fill in real values from your Firebase console.
const isTestEnv = typeof process !== 'undefined' && process.env.NODE_TEST_CONTEXT;

const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || (isTestEnv ? 'test-api-key-dummy' : undefined),
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || (isTestEnv ? 'test-project' : undefined),
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || (isTestEnv ? '1:12345:web:abcdef' : undefined),
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Use initializeFirestore with persistentLocalCache (replaces deprecated enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

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
if (!isTestEnv && typeof window !== 'undefined') {
  fetchAndActivate(remoteConfig)
    .then((activated) => {
      console.log(`[Firebase Remote Config] Config fetched & activated (New changes: ${activated})`);
    })
    .catch((err) => {
      console.warn('[Firebase Remote Config] Fetch skipped, using default config:', err);
    });
}

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
const hasConsent = typeof localStorage !== 'undefined' ? localStorage.getItem('flux-analytics-consent') === 'true' : false;

if (hasConsent) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export default app;
