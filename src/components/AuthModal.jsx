import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { showToast } from './Toast';
import { ShieldCheck, Clock, Mail, Lock, User, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { 
  signInWithPopup, 
  signInWithCredential, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthModal({ onComplete }) {
  const [authTab, setAuthTab] = useState('google'); // 'google' | 'email' | 'guest'
  const [emailMode, setEmailMode] = useState('login'); // 'login' | 'signup'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(25);
  
  const googleBtnRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const updateProfile = useStore((s) => s.updateProfile);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Timebound safety timer (25s max per auth cycle)
  const startAuthCycleTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setTimeLeft(25);
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(() => {
      setLoading(false);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setError('Authentication cycle timed out (25s limit). Automatically returned to login screen.');
      showToast('Login attempt timed out. Returned to login screen ⏱️', '⚠️');
    }, 25000);
  };

  const stopAuthCycleTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  // Initialize Google Identity Services (GSI In-App Native Auth)
  useEffect(() => {
    if (authTab === 'google' && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: '984328987655-1d849fa847cbe3228e76a2.apps.googleusercontent.com',
          callback: async (response) => {
            if (response && response.credential) {
              setLoading(true);
              startAuthCycleTimer();
              try {
                const credential = GoogleAuthProvider.credential(response.credential);
                const res = await signInWithCredential(auth, credential);
                stopAuthCycleTimer();
                if (res && res.user) {
                  const displayName = res.user.displayName || 'Flux Scholar';
                  updateProfile({
                    userName: displayName,
                    isAuthenticated: true,
                    userId: res.user.uid,
                    userEmail: res.user.email,
                    userAvatar: res.user.photoURL || '⚡',
                  });
                  showToast(`Google Authentication successful! Welcome ${displayName}! 🚀`, '✨');
                  onComplete && onComplete();
                }
              } catch (credErr) {
                stopAuthCycleTimer();
                console.warn('[FLUX GSI] Credential login error:', credErr);
                setError('Google Credential auth error. Please try again.');
              } finally {
                setLoading(false);
              }
            }
          },
          auto_select: false,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_blue',
          size: 'large',
          width: 320,
          shape: 'pill',
          text: 'continue_with',
        });
      } catch (gsiErr) {
        console.warn('[FLUX GSI] Setup notice:', gsiErr);
      }
    }
  }, [authTab]);

  const doPopupSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const res = await signInWithPopup(auth, provider);
      stopAuthCycleTimer();

      if (res && res.user) {
        const displayName = res.user.displayName || 'Flux Scholar';
        updateProfile({
          userName: displayName,
          isAuthenticated: true,
          userId: res.user.uid,
          userEmail: res.user.email,
          userAvatar: res.user.photoURL || '⚡',
        });
        showToast(`Google Sign-In successful! Welcome ${displayName}! 🚀`, '✨');
        setLoading(false);
        onComplete && onComplete();
      }
    } catch (err) {
      stopAuthCycleTimer();
      console.warn('[FLUX Auth] Google Sign-In error:', err);
      setLoading(false);
      const code = err?.code || '';
      const msg = err?.message || 'Google Auth notice';

      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Domain authorization required. Please add domain in Firebase Console.');
      } else {
        setError(`Google Auth notice: ${msg}`);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    startAuthCycleTimer();

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            doPopupSignIn();
          }
        });
      } catch (e) {
        doPopupSignIn();
      }
    } else {
      doPopupSignIn();
    }
  };

  // Firebase Email/Password Handler (Login & Signup)
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (emailMode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setError('');
    setLoading(true);
    startAuthCycleTimer();

    try {
      if (emailMode === 'login') {
        const res = await signInWithEmailAndPassword(auth, email, password);
        stopAuthCycleTimer();
        if (res && res.user) {
          const name = res.user.displayName || email.split('@')[0] || 'Flux Scholar';
          updateProfile({
            userName: name,
            isAuthenticated: true,
            userId: res.user.uid,
            userEmail: res.user.email,
            userAvatar: res.user.photoURL || '⚡',
          });
          showToast(`Welcome back, ${name}! 🚀`, '✨');
          setLoading(false);
          onComplete && onComplete();
        }
      } else {
        // Create Account
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (res && res.user) {
          await updateFirebaseProfile(res.user, { displayName: fullName.trim() });
          stopAuthCycleTimer();
          updateProfile({
            userName: fullName.trim(),
            isAuthenticated: true,
            userId: res.user.uid,
            userEmail: res.user.email,
            userAvatar: '⚡',
          });
          showToast(`Account created! Welcome to FLUX, ${fullName.trim()}! 🎉`, '✨');
          setLoading(false);
          onComplete && onComplete();
        }
      }
    } catch (err) {
      stopAuthCycleTimer();
      setLoading(false);
      const code = err?.code || '';
      console.warn('[FLUX Email Auth Error]:', code, err);

      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setError('Invalid email or password. Please check your details and try again.');
      } else if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please switch to Sign In.');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Authentication error. Please try again.');
      }
    }
  };

  const handleGuestSignIn = () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    updateProfile({
      userName: 'Guest Scholar',
      isAuthenticated: true,
      userId: guestId,
      userEmail: 'guest@flux.app',
      userAvatar: '⚡',
    });
    showToast('Welcome to FLUX! ⚡ (Guest Mode Active)', '✨');
    onComplete && onComplete();
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
        <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, lineHeight: 1.5, marginBottom: '24px' }}>
          Master deep focus, track your syllabus, and achieve your goals with Cloud Sync.
        </p>

        {/* Auth Method Navigation Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '16px', padding: '4px', marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            onClick={() => { setAuthTab('google'); setError(''); }}
            style={{
              flex: 1, padding: '10px 4px', borderRadius: '12px', border: 'none',
              background: authTab === 'google' ? '#0ea5e9' : 'transparent',
              color: authTab === 'google' ? '#fff' : '#94a3b8',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
            }}
          >
            Google
          </button>
          <button
            onClick={() => { setAuthTab('email'); setError(''); }}
            style={{
              flex: 1, padding: '10px 4px', borderRadius: '12px', border: 'none',
              background: authTab === 'email' ? '#0ea5e9' : 'transparent',
              color: authTab === 'email' ? '#fff' : '#94a3b8',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
            }}
          >
            Email
          </button>
          <button
            onClick={() => { setAuthTab('guest'); setError(''); }}
            style={{
              flex: 1, padding: '10px 4px', borderRadius: '12px', border: 'none',
              background: authTab === 'guest' ? '#0ea5e9' : 'transparent',
              color: authTab === 'guest' ? '#fff' : '#94a3b8',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
            }}
          >
            Guest
          </button>
        </div>

        {/* Error Diagnostics Box */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px', padding: '12px 14px', marginBottom: '16px',
            fontSize: '12px', color: '#fca5a5', fontWeight: 600, textAlign: 'left',
            lineHeight: 1.4,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* TAB 1: GOOGLE AUTH */}
        {authTab === 'google' && (
          <div>
            <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', minHeight: '44px' }} />

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%', padding: '15px', borderRadius: '18px',
                background: '#ffffff', color: '#0f172a', border: 'none',
                fontWeight: 800, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 12px 30px -5px rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} className="animate-spin" />
                  Authenticating ({timeLeft}s max)...
                </span>
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

        {/* TAB 2: EMAIL / PASSWORD AUTH */}
        {authTab === 'email' && (
          <form onSubmit={handleEmailAuth} style={{ textAlign: 'left' }}>
            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setEmailMode('login'); setError(''); }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '12px', border: 'none',
                  background: emailMode === 'login' ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: emailMode === 'login' ? '#fff' : '#94a3b8',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <LogIn size={14} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setEmailMode('signup'); setError(''); }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '12px', border: 'none',
                  background: emailMode === 'signup' ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: emailMode === 'signup' ? '#fff' : '#94a3b8',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <UserPlus size={14} /> Create Account
              </button>
            </div>

            {emailMode === 'signup' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                  FULL NAME
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="e.g. Alex Carter"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 12px 12px 38px', borderRadius: '14px',
                      background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'Outfit, sans-serif',
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 12px 12px 38px', borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'Outfit, sans-serif',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 12px 12px 38px', borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'Outfit, sans-serif',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                color: '#fff', border: 'none', fontWeight: 800, fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.4)',
                transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span>Authenticating ({timeLeft}s)...</span>
              ) : emailMode === 'login' ? (
                <span>Sign In to FLUX ⚡</span>
              ) : (
                <span>Create Account 🚀</span>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: GUEST MODE */}
        {authTab === 'guest' && (
          <div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '20px', lineHeight: 1.5 }}>
              Try FLUX in Guest Mode without creating an account. Your progress will be saved locally on your device.
            </p>

            <button
              onClick={handleGuestSignIn}
              style={{
                width: '100%', padding: '15px', borderRadius: '18px',
                background: 'rgba(255, 255, 255, 0.1)', color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontWeight: 800, fontSize: '15px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
              }}
            >
              <Sparkles size={18} color="#0ea5e9" />
              <span>Continue as Guest ⚡</span>
            </button>
          </div>
        )}

        {/* Security Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          marginTop: '24px', fontSize: '11px', color: '#64748b', fontWeight: 600,
        }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span>Protected by Firebase Authentication Security</span>
        </div>
      </div>
    </div>
  );
}
