import React, { useState } from 'react';
import useStore from '../store/useStore';
import { showToast } from './Toast';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthModal({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateProfile = useStore((s) => s.updateProfile);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
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
    } catch (err) {
      console.warn('[FLUX Auth] Google Sign-In error:', err);
      setLoading(false);
      const code = err?.code || '';
      const msg = err?.message || 'Google Auth service unavailable';
      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing. Please try again.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Firebase domain authorization pending for this domain. Click Guest Mode below to enter instantly!');
      } else if (code === 'auth/popup-blocked') {
        setError('Browser blocked sign-in popup. Please allow popups or use Guest Mode below.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in Firebase Console. Click Guest Mode below to enter!');
      } else {
        setError(`Google Auth notice: ${code ? `(${code}) ` : ''}${msg}. Click Guest Mode below to enter instantly!`);
      }
    }
  };

  const handleGuestContinue = () => {
    const guestName = 'Scholar';
    const randomId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).slice(2, 11);
    updateProfile({
      userName: guestName,
      isAuthenticated: true,
      userId: `guest_${randomId}`,
    });
    showToast(`Welcome to FLUX, ${guestName}!`, '🚀');
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
        width: '100%', maxWidth: '400px',
        background: 'rgba(30, 41, 59, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '32px', padding: '40px 32px',
        color: '#fff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center', animation: 'fadeInUp 0.35s ease',
      }}>
        {/* App Logo & Header */}
        <div style={{
          width: 64, height: 64, borderRadius: '22px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', color: '#fff', fontWeight: 900,
          boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
        }}>
          ⚡
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Welcome to FLUX
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500, lineHeight: 1.5, marginBottom: '32px' }}>
          Build daily discipline, master deep focus, and lock in your goals with Google Cloud sync.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5', padding: '14px 16px', borderRadius: '16px',
            fontSize: '13px', fontWeight: 600, marginBottom: '20px', textAlign: 'left',
          }}>
            <div style={{ marginBottom: '8px' }}>{error}</div>
            <button
              onClick={handleGuestContinue}
              style={{
                width: '100%', padding: '8px 12px', background: '#38bdf8', color: '#0f172a',
                border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <Zap size={14} /> Continue in Guest Mode Now
            </button>
          </div>
        )}

        {/* Google 1-Tap Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%', padding: '16px',
            background: '#ffffff', color: '#0f172a',
            border: 'none', borderRadius: '20px',
            fontSize: '15px', fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            boxShadow: '0 6px 20px rgba(255, 255, 255, 0.15)',
            marginBottom: '16px', transition: 'all 0.2s ease',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          {loading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        {/* Offline / Guest Mode Option */}
        <button
          onClick={handleGuestContinue}
          style={{
            width: '100%', padding: '14px',
            background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <Zap size={14} color="#38bdf8" /> Continue Offline / Guest Mode
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '28px', color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
          <ShieldCheck size={14} color="#10b981" /> 100% Private · Zero Spam Guarantee
        </div>
      </div>
    </div>
  );
}
