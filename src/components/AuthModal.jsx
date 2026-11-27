import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { showToast } from './Toast';
import { ShieldCheck, Mail, Lock, User, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithGoogleToken,
  signInWithEmail,
  signUpWithEmail,
  GOOGLE_WEB_CLIENT_ID
} from '../auth/authService.js';

export default function AuthModal({ onComplete }) {
  const [authTab, setAuthTab] = useState('google'); // 'google' | 'email' | 'guest'
  const [emailMode, setEmailMode] = useState('login'); // 'login' | 'signup'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(25);
  
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const googleBtnRef = useRef(null);

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
      setError('Authentication cycle timed out. Please try again or use Email / Guest mode.');
      showToast('Login attempt timed out ⏱️', '⚠️');
    }, 25000);
  };

  const stopAuthCycleTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  // Google Identity Services (GSI) One Tap / Button for Web Browser
  useEffect(() => {
    if (authTab === 'google' && typeof window !== 'undefined' && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_WEB_CLIENT_ID,
          callback: async (response) => {
            if (response && response.credential) {
              setLoading(true);
              startAuthCycleTimer();
              const { user, error: gErr } = await signInWithGoogleToken(response.credential);
              stopAuthCycleTimer();
              setLoading(false);

              if (user) {
                const displayName = user.displayName || 'Flux Scholar';
                updateProfile({
                  userName: displayName,
                  isAuthenticated: true,
                  userId: user.uid,
                  userEmail: user.email,
                  userAvatar: user.photoURL || '⚡',
                });
                showToast(`Welcome ${displayName}! 🚀`, '✨');
                onComplete && onComplete();
              } else if (gErr) {
                setError(gErr.message || 'Google authentication notice.');
              }
            }
          },
          auto_select: false,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_blue',
          size: 'large',
          width: 300,
          shape: 'pill',
          text: 'continue_with',
        });
      } catch (e) {
        console.warn('[FLUX GSI] Init notice:', e);
      }
    }
  }, [authTab]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    startAuthCycleTimer();

    const { user, error: authErr } = await signInWithGoogle();
    stopAuthCycleTimer();
    setLoading(false);

    if (user) {
      const displayName = user.displayName || 'Flux Scholar';
      updateProfile({
        userName: displayName,
        isAuthenticated: true,
        userId: user.uid,
        userEmail: user.email,
        userAvatar: user.photoURL || '⚡',
      });
      showToast(`Welcome ${displayName}! 🚀`, '✨');
      onComplete && onComplete();
    } else if (authErr) {
      const code = authErr?.code || '';
      const msg = authErr?.message || 'Google Auth notice';

      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed.');
      } else if (code === 'auth/popup-blocked') {
        setError('Popups were blocked by your browser. Please allow popups or try Email sign-in.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Domain authorization required. Please add your domain in Firebase Console.');
      } else {
        setError(`Google Auth notice: ${msg}`);
      }
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
        const { user, error: loginErr } = await signInWithEmail(email, password);
        stopAuthCycleTimer();
        setLoading(false);

        if (user) {
          const name = user.displayName || email.split('@')[0] || 'Flux Scholar';
          updateProfile({
            userName: name,
            isAuthenticated: true,
            userId: user.uid,
            userEmail: user.email,
            userAvatar: user.photoURL || '⚡',
          });
          showToast(`Welcome back, ${name}! 🚀`, '✨');
          onComplete && onComplete();
        } else if (loginErr) {
          const code = loginErr.code || '';
          if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
            setError('Invalid email or password. Please verify your credentials.');
          } else if (code === 'auth/too-many-requests') {
            setError('Too many failed attempts. Please reset password or try again later.');
          } else {
            setError(`Sign-in error: ${loginErr.message}`);
          }
        }
      } else {
        // Signup
        const { user, error: signupErr } = await signUpWithEmail(email, password, fullName.trim());
        stopAuthCycleTimer();
        setLoading(false);

        if (user) {
          updateProfile({
            userName: fullName.trim(),
            isAuthenticated: true,
            userId: user.uid,
            userEmail: user.email,
            userAvatar: '⚡',
          });
          showToast(`Account created! Welcome, ${fullName}! 🎉`, '✨');
          onComplete && onComplete();
        } else if (signupErr) {
          const code = signupErr.code || '';
          if (code === 'auth/email-already-in-use') {
            setError('An account with this email already exists. Please log in.');
          } else if (code === 'auth/weak-password') {
            setError('Password is too weak. Please use at least 6 characters.');
          } else if (code === 'auth/invalid-email') {
            setError('Invalid email address format.');
          } else {
            setError(`Signup notice: ${signupErr.message}`);
          }
        }
      }
    } catch (err) {
      stopAuthCycleTimer();
      setLoading(false);
      console.warn('[FLUX Auth] Email Auth error:', err);
      setError(`Auth error: ${err.message}`);
    }
  };

  const handleGuestSignIn = () => {
    const randomGuestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    updateProfile({
      userName: 'Guest Explorer',
      isAuthenticated: true,
      userId: randomGuestId,
      userEmail: null,
      userAvatar: '⚡',
    });
    showToast('Welcome to FLUX in Guest Mode! 🚀', '✨');
    onComplete && onComplete();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(10, 15, 30, 0.95)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '28px',
        maxWidth: '420px',
        width: '100%',
        padding: '32px 24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.15)',
        textAlign: 'center',
      }}>
        {/* FLUX Brand Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.5)',
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Welcome to FLUX
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.5 }}>
          Focus, build consistency, and level up your productivity.
        </p>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex', background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '16px', padding: '4px', marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => { setAuthTab('google'); setError(''); }}
            style={{
              flex: 1, padding: '10px 0', borderRadius: '12px', border: 'none',
              background: authTab === 'google' ? '#0ea5e9' : 'transparent',
              color: authTab === 'google' ? '#fff' : '#94a3b8',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => { setAuthTab('email'); setError(''); }}
            style={{
              flex: 1, padding: '10px 0', borderRadius: '12px', border: 'none',
              background: authTab === 'email' ? '#0ea5e9' : 'transparent',
              color: authTab === 'email' ? '#fff' : '#94a3b8',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => { setAuthTab('guest'); setError(''); }}
            style={{
              flex: 1, padding: '10px 0', borderRadius: '12px', border: 'none',
              background: authTab === 'guest' ? '#0ea5e9' : 'transparent',
              color: authTab === 'guest' ? '#fff' : '#94a3b8',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            Guest
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '14px', padding: '12px 14px', marginBottom: '16px',
            color: '#f87171', fontSize: '12px', textAlign: 'left', lineHeight: 1.4,
          }}>
            {error}
          </div>
        )}

        {/* TAB 1: GOOGLE AUTH */}
        {authTab === 'google' && (
          <div>
            <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', minHeight: '40px' }} />

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '16px',
                background: '#fff', color: '#0f172a', border: 'none',
                fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{loading ? `Authenticating (${timeLeft}s)...` : 'Continue with Google'}</span>
            </button>
          </div>
        )}

        {/* TAB 2: EMAIL AUTH */}
        {authTab === 'email' && (
          <form onSubmit={handleEmailAuth} style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setEmailMode('login'); setError(''); }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '10px',
                  background: emailMode === 'login' ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
                  border: `1px solid ${emailMode === 'login' ? '#0ea5e9' : 'rgba(255,255,255,0.1)'}`,
                  color: emailMode === 'login' ? '#38bdf8' : '#94a3b8',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <LogIn size={14} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setEmailMode('signup'); setError(''); }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '10px',
                  background: emailMode === 'signup' ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
                  border: `1px solid ${emailMode === 'signup' ? '#0ea5e9' : 'rgba(255,255,255,0.1)'}`,
                  color: emailMode === 'signup' ? '#38bdf8' : '#94a3b8',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <UserPlus size={14} /> Register
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
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
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
                  placeholder={emailMode === 'signup' ? "your@email.com" : "name@example.com"}
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
                background: '#0ea5e9',
                color: '#fff', border: 'none', fontWeight: 800, fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 8px 22px -4px rgba(14, 165, 233, 0.4)',
                transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span>Authenticating ({timeLeft}s)...</span>
              ) : emailMode === 'login' ? (
                <span>Sign In</span>
              ) : (
                <span>Create Account</span>
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
              type="button"
              onClick={handleGuestSignIn}
              style={{
                width: '100%', padding: '14px', borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.08)', color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
              }}
            >
              <span>Continue as Guest</span>
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
