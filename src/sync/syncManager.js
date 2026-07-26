/**
 * FLUX — Offline-First Sync Architecture
 * 
 * How it works:
 * 1. ALL data writes go to localStorage FIRST (instant, always works)
 * 2. If online → also write to Firebase immediately
 * 3. If offline → queue the write in syncQueue
 * 4. When connection restores → flush syncQueue to Firebase
 * 5. Firebase is ONLY a backup/sync layer — app NEVER depends on it
 * 
 * Security:
 * - Data is stored in localStorage under a namespaced key
 * - On native Android (Capacitor), this maps to the app's private data directory
 *   (/data/data/com.flux.app/) — inaccessible to other apps without root
 * - No other browser/app can read a different origin's localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Network Status Store ────────────────────────────────────────────────────
export const useNetworkStore = create((set) => ({
  isOnline: navigator.onLine,
  syncStatus: 'synced', // 'synced' | 'syncing' | 'pending' | 'error'
  pendingChanges: 0,
  lastSyncedAt: null,

  setOnline: (val) => set({ isOnline: val }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setPendingChanges: (n) => set({ pendingChanges: n }),
  setLastSyncedAt: (ts) => set({ lastSyncedAt: ts }),
}));

// ─── Sync Queue Store ────────────────────────────────────────────────────────
// Stores operations that need to be synced to Firebase when online
export const useSyncQueue = create(
  persist(
    (set, get) => ({
      queue: [], // Array of { id, type, collection, data, timestamp, retries }

      enqueue: (operation) => {
        const randomSuffix = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID().slice(0, 8) 
          : Math.random().toString(36).slice(2, 7);
        const op = {
          id: `op_${Date.now()}_${randomSuffix}`,
          timestamp: new Date().toISOString(),
          retries: 0,
          ...operation,
        };
        set((state) => {
          const nextQueue = [...state.queue, op];
          // Cap maximum offline queue size to 100 items to prevent write bursts and memory leaks
          const cappedQueue = nextQueue.length > 100 ? nextQueue.slice(-100) : nextQueue;
          return { queue: cappedQueue };
        });
        useNetworkStore.getState().setPendingChanges(get().queue.length);
        return op.id;
      },

      dequeue: (opId) => {
        set((state) => ({
          queue: state.queue.filter((op) => op.id !== opId),
        }));
        const remaining = get().queue.length;
        useNetworkStore.getState().setPendingChanges(remaining);
        if (remaining === 0) {
          useNetworkStore.getState().setSyncStatus('synced');
          useNetworkStore.getState().setLastSyncedAt(new Date().toISOString());
        }
      },

      incrementRetry: (opId) => {
        set((state) => ({
          queue: state.queue.map((op) =>
            op.id === opId ? { ...op, retries: op.retries + 1 } : op
          ),
        }));
      },

      clearQueue: () => {
        set({ queue: [] });
        useNetworkStore.getState().setPendingChanges(0);
        useNetworkStore.getState().setSyncStatus('synced');
      },

      getQueue: () => get().queue,
    }),
    {
      name: 'flux-sync-queue',
    }
  )
);

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

let isFlushing = false;

export async function writeToFirebase(collectionName, docId, data) {
  try {
    const uid = auth.currentUser?.uid || 'guest';
    const docRef = doc(db, 'users', `${uid}_${collectionName}_${docId || 'user_data'}`);
    await setDoc(docRef, { ...data, _userId: uid, _updatedAt: serverTimestamp() }, { merge: true });
    console.log(`[FLUX Firebase Sync] ✅ Firestore write success: users/${uid}_${collectionName}_${docId || 'user_data'}`);
    return true;
  } catch (err) {
    console.warn(`[FLUX Firebase Sync] Firestore write error for ${collectionName}/${docId}:`, err);
    throw err;
  }
}

export async function flushSyncQueue() {
  if (isFlushing) return;
  const { queue, dequeue, incrementRetry } = useSyncQueue.getState();
  const { isOnline, setSyncStatus } = useNetworkStore.getState();

  if (!isOnline || queue.length === 0) return;

  isFlushing = true;
  setSyncStatus('syncing');

  for (const op of [...queue]) {
    try {
      await writeToFirebase(op.collection, op.docId, op.data);
      dequeue(op.id);
    } catch (err) {
      incrementRetry(op.id);
      // Drop operations that have failed 5+ times (corrupted/stale)
      if (op.retries >= 5) dequeue(op.id);
      setSyncStatus('error');
    }
  }

  isFlushing = false;
}

// ─── Network Event Listeners ─────────────────────────────────────────────────
// Call this once at app startup
let flushTimeoutId = null;

export function initNetworkListeners() {
  const { setOnline, setSyncStatus } = useNetworkStore.getState();

  const handleOnline = () => {
    setOnline(true);
    setSyncStatus('syncing');
    if (flushTimeoutId) clearTimeout(flushTimeoutId);
    flushTimeoutId = setTimeout(() => flushSyncQueue(), 500);
  };

  const handleOffline = () => {
    setOnline(false);
    setSyncStatus('pending');
    if (flushTimeoutId) clearTimeout(flushTimeoutId);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial flush if already online
  if (navigator.onLine) flushSyncQueue();

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    if (flushTimeoutId) clearTimeout(flushTimeoutId);
  };
}

// ─── Data Write Helper ────────────────────────────────────────────────────────
// Use this for every data mutation — handles local + sync automatically
export function writeData(collection, docId, data) {
  const { isOnline } = useNetworkStore.getState();
  const { enqueue } = useSyncQueue.getState();

  // 1. Local write already happens via Zustand (always instant)
  
  // 2. Queue for Firebase sync
  const op = { type: 'set', collection, docId, data };
  
  if (isOnline) {
    // Try to write immediately
    writeToFirebase(collection, docId, data).catch(() => {
      // Failed even though online — queue it
      enqueue(op);
    });
  } else {
    // Offline — queue for later
    enqueue(op);
    useNetworkStore.getState().setSyncStatus('pending');
  }
}
