import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { showToast } from './Toast';
import { Sparkles, ShieldCheck, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthModal({ onComplete }) {
  const [authMode, setAuthMode] = useState('google'); // 'google' | 'email_login' | 'email_signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateProfile = useStore((s) => s.updateProfile);

  // Check redirect result on mobile redirect return
  useEffect(() => {
    getRedirectResult(auth)
      .then((res) => {
        if (res && res.user) {
          const displayName = res.user.displayName || 'Flux Scholar';
          updateProfile({
            userName: displayName,
            isAuthenticated: true,
            userId: res.user.uid,
            userEmail: res.user.email,
            userAvatar: res.user.photoURL || '⚡',
          });
          showToast(`Firebase Google Auth successful! Welcome ${displayName}! 🚀`, '✨');
          onComplete && onComplete();
        }
      })
      .catch((err) => {
        console.warn('[FLUX Auth] Redirect sign-in result notice:', err);
      });
  }, []);

  // 1. Firebase Google Auth Handler
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      let res = null;
      try {
        res = await signInWithPopup(auth, provider);
      } catch (popupErr) {
        if (popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/popup-closed-by-user') {
          console.log('[FLUX Auth] Popup blocked/closed, redirecting to Firebase Auth handler...');
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      if (res && res.user) {
        const displayName = res.user.displayName || 'Flux Scholar';
        updateProfile({
          userName: displayName,
          isAuthenticated: true,
          userId: res.user.uid,
          userEmail: res.user.email,
          userAvatar: res.user.photoURL || '⚡',
        });
        showToast(`Firebase Auth Verified! Welcome ${displayName}! 🚀`, '✨');
        setLoading(false);
        onComplete && onComplete();
      }
    } catch (err) {
      console.warn('[FLUX Auth] Google Sign-In error:', err);
      setLoading(false);
      const code = err?.code || '';
      const msg = err?.message || 'Firebase Auth service error';
      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Domain authorization required in Firebase Console -> Authentication -> Authorized Domains.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in Firebase Console (Authentication -> Sign-in method -> Google).');
      } else if (code === 'auth/network-request-failed') {
        setError('Firebase Auth network error. Please check your internet connection or use Email Sign-In below.');
      } else {
        setError(`Firebase Auth error (${code}): ${msg}`);
      }
    }
  };

  // 2. Firebase Email/Password Sign Up
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password || !name.trim()) {
      setError('Please fill in all fields (Name, Email & Password).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Update Firebase Profile Display Name
      await updateFirebaseProfile(user, { displayName: name.trim() });

      updateProfile({
        userName: name.trim(),
        userEmail: user.email,
        isAuthenticated: true,
        userId: user.uid,
        userAvatar: '⚡',
      });

      showToast(`Account created on Firebase! Welcome ${name.trim()}! 🚀`, '🎉');
      setLoading(false);
      onComplete && onComplete();
    } catch (err) {
      console.error('[FLUX Auth] Email Sign Up error:', err);
      setLoading(false);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(err.message || 'Failed to create account on Firebase.');
      }
    }
  };

  // 3. Firebase Email/Password Log In
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      const displayName = user.displayName || email.split('@')[0];

      updateProfile({
        userName: displayName,
        userEmail: user.email,
        isAuthenticated: true,
        userId: user.uid,
        userAvatar: '⚡',
      });

      showToast(`Firebase Auth Verified! Welcome back ${displayName}! 🚀`, '✨');
      setLoading(false);
      onComplete && onComplete();
    } catch (err) {
      console.error('[FLUX Auth] Email Login error:', err);
      setLoading(false);
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Incorrect email or password. Please check your credentials.');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError(err.message || 'Firebase login failed.');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', overflowY: 'auto',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'rgba(30, 41, 59, 0.88)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '32px', padding: '36px 28px',
        color: '#fff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        textAlign: 'center', animation: 'fadeInUp 0.35s ease',
      }}>
        {/* App 3D Logo Header */}
        <div style={{
          width: 72, height: 72, borderRadius: '24px', margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #7c3aed 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '40px', color: '#fff', fontWeight: 900,
          boxShadow: '0 12px 30px -5px rgba(14, 165, 233, 0.5), inset 0 2px 3px rgba(255,255,255,0.4)',
          letterSpacing: '-1px', userSelect: 'none',
        }}>
          F
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '6px' }}>
          Welcome to FLUX
        </h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, lineHeight: 1.4, marginBottom: '22px' }}>
          Secure Firebase Authentication &amp; Encrypted Cloud Sync
        </p>

        {/* Auth Mode Toggle Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '4px',
          borderRadius: '16px', marginBottom: '22px', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <button
            onClick={() => setAuthMode('google')}
            style={{
              flex: 1, padding: '8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
              border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              background: authMode === 'google' ? '#0ea5e9' : 'transparent',
              color: authMode === 'google' ? '#fff' : '#94a3b8',
              transition: 'all 0.2s ease',
            }}
          >
            Google
          </button>
          <button
            onClick={() => setAuthMode('email_login')}
            style={{
              flex: 1, padding: '8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
              border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              background: authMode === 'email_login' ? '#0ea5e9' : 'transparent',
              color: authMode === 'email_login' ? '#fff' : '#94a3b8',
              transition: 'all 0.2s ease',
            }}
          >
            Log In
          </button>
          <button
            onClick={() => setAuthMode('email_signup')}
            style={{
              flex: 1, padding: '8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
              border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              background: authMode === 'email_signup' ? '#0ea5e9' : 'transparent',
              color: authMode === 'email_signup' ? '#fff' : '#94a3b8',
              transition: 'all 0.2s ease',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Diagnostics Box */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px', padding: '12px 14px', marginBottom: '20px',
            fontSize: '12px', color: '#fca5a5', fontWeight: 600, textAlign: 'left',
            lineHeight: 1.4,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* METHOD 1: Firebase Google Authentication */}
        {authMode === 'google' && (
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%', padding: '16px', borderRadius: '18px',
                background: '#ffffff', color: '#0f172a', border: 'none',
                fontWeight: 800, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                boxShadow: '0 10px 25px -5px rgba(255, 255, 255, 0.25)',
                transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span>Authenticating with Firebase...</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* METHOD 2: Firebase Email Sign In */}
        {authMode === 'email_login' && (
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input
                type="email"
                required
                placeholder="Google / Firebase Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Outfit, sans-serif',
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Outfit, sans-serif',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '16px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', border: 'none',
                fontWeight: 800, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.5)',
                fontFamily: 'Outfit, sans-serif', opacity: loading ? 0.7 : 1,
              }}
            >
              <LogIn size={18} />
              <span>{loading ? 'Authenticating...' : 'Log In with Firebase'}</span>
            </button>
          </form>
        )}

        {/* METHOD 3: Firebase Email Sign Up */}
        {authMode === 'email_signup' && (
          <form onSubmit={handleEmailSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input
                type="text"
                required
                placeholder="Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Outfit, sans-serif',
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Outfit, sans-serif',
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input
                type="password"
                required
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Outfit, sans-serif',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '16px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', border: 'none',
                fontWeight: 800, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.5)',
                fontFamily: 'Outfit, sans-serif', opacity: loading ? 0.7 : 1,
              }}
            >
              <UserPlus size={18} />
              <span>{loading ? 'Creating Account...' : 'Create Firebase Account'}</span>
            </button>
          </form>
        )}

        {/* Security Assurance Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          marginTop: '24px', fontSize: '11px', color: '#64748b', fontWeight: 600,
        }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span>256-bit Encrypted Firebase Identity &amp; Cloud Security</span>
        </div>
      </div>
    </div>
  );
}
