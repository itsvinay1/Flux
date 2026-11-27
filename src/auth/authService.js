/**
 * FLUX - Unified Authentication Service
 * 
 * Provides a clean, platform-resilient interface for Google & Email authentication,
 * token retrieval, session management, and server-side data purging.
 */

import {
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  deleteUser,
} from 'firebase/auth';
import { doc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase.js';

export const GOOGLE_WEB_CLIENT_ID = '984328987655-92ob13b1moohqkitcu0hkuu9t7r69jdn.apps.googleusercontent.com';

/**
 * Sign in or sign up using Google.
 * Uses popup on Web and within the custom Android WebView dialog handler.
 */
export async function signInWithGoogle() {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return { user: res.user, error: null };
  } catch (err) {
    console.warn('[authService] signInWithGoogle notice:', err);
    return { user: null, error: err };
  }
}

/**
 * Sign in using Google ID token / credential from Google Identity Services (GSI).
 */
export async function signInWithGoogleToken(idToken) {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const res = await signInWithCredential(auth, credential);
    return { user: res.user, error: null };
  } catch (err) {
    console.warn('[authService] signInWithGoogleToken notice:', err);
    return { user: null, error: err };
  }
}

/**
 * Sign in with Email and Password.
 */
export async function signInWithEmail(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return { user: res.user, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
}

/**
 * Register a new user with Email, Password, and Display Name.
 */
export async function signUpWithEmail(email, password, displayName) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (res.user && displayName) {
      await updateProfile(res.user, { displayName });
    }
    return { user: res.user, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
}

/**
 * Sign out current user.
 */
export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    console.warn('[authService] signOut error:', err);
    return { success: false, error: err };
  }
}

/**
 * Returns current access token or null if not authenticated.
 */
export async function getAccessToken() {
  try {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken(false);
  } catch (e) {
    return null;
  }
}

/**
 * Deletes all remote Firestore data associated with the user, then deletes the Firebase Auth account.
 * Throws an Error if remote deletion fails so the client never wipes local data prematurely.
 */
export async function deleteRemoteUserData(userId) {
  const uid = userId || auth.currentUser?.uid;
  if (!uid || uid === 'guest' || uid.startsWith('guest_')) {
    // Guest users have no remote records
    return { success: true };
  }

  try {
    const subcollections = ['focusSessions', 'journalEntries', 'habits', 'roadmap', 'syllabus', 'profile'];

    // 1. Delete documents in all known user subcollections
    for (const subcol of subcollections) {
      try {
        const subcolRef = collection(db, 'users', uid, subcol);
        const snapshot = await getDocs(subcolRef);
        const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);
      } catch (subErr) {
        console.warn(`[authService] Could not clear subcollection ${subcol}:`, subErr);
      }
    }

    // 2. Delete root user document if present
    try {
      const userDocRef = doc(db, 'users', uid);
      await deleteDoc(userDocRef);
    } catch (rootErr) {
      console.warn('[authService] Could not delete root user doc:', rootErr);
    }

    // 3. Delete Firebase Auth User account
    if (auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
      } catch (authDeleteErr) {
        console.warn('[authService] deleteUser notice:', authDeleteErr);
        // If reauthentication is needed, still let user know
        if (authDeleteErr.code === 'auth/requires-recent-login') {
          throw new Error('Please sign out and sign in again before deleting your account.');
        }
      }
    }

    return { success: true };
  } catch (err) {
    console.error('[authService] Remote account deletion failed:', err);
    throw new Error('Could not delete on the server. Your data is still here. Try again.');
  }
}
