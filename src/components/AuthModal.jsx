import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { showToast } from './Toast';
import { ShieldCheck } from 'lucide-react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signInWithCredential, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthModal({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleBtnRef = useRef(null);

  const updateProfile = useStore((s) => s.updateProfile);

  // 1. Initialize Google Identity Services (GSI) In-App Native Auth
  useEffect(() => {
    // Process redirect result if returned from external redirect
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
          showToast(`Google Sign-In successful! Welcome ${displayName}! 🚀`, '✨');
          onComplete && onComplete();
        }
      })
      .catch((err) => {
        console.warn('[FLUX Auth] Redirect result notice:', err);
      });

    // Setup Google One-Tap / GSI in-app prompt
    if (window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: '984328987655-1d849fa847cbe3228e76a2.apps.googleusercontent.com',
          callback: async (response) => {
            if (response && response.credential) {
              setLoading(true);
              try {
                const credential = GoogleAuthProvider.credential(response.credential);
                const res = await signInWithCredential(auth, credential);
                if (res && res.user) {
                  const displayName = res.user.displayName || 'Flux Scholar';
                  updateProfile({
                    userName: displayName,
                    isAuthenticated: true,
                    userId: res.user.uid,
                    userEmail: res.user.email,
                    userAvatar: res.user.photoURL || '⚡',
                  });
                  showToast(`In-App Google Authentication verified! Welcome ${displayName}! 🚀`, '✨');
                  onComplete && onComplete();
                }
              } catch (credErr) {
                console.warn('[FLUX GSI] Credential login error:', credErr);
              } finally {
                setLoading(false);
              }
            }
          },
          auto_select: false,
        });

        // Render official GSI button in container
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
  }, []);

  // 2. Primary / Fallback Firebase Google Auth Handler
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
        if (popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/popup-closed-by-user' || popupErr?.code === 'auth/operation-not-supported-in-this-environment') {
          console.log('[FLUX Auth] Popup unsupported or blocked, executing redirect...');
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
        showToast(`Google Sign-In successful! Welcome ${displayName}! 🚀`, '✨');
        setLoading(false);
        onComplete && onComplete();
      }
    } catch (err) {
      console.warn('[FLUX Auth] Google Sign-In error:', err);
      setLoading(false);
      const code = err?.code || '';
      const msg = err?.message || 'Google Auth service notice';
      
      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing. Please try again.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Domain authorization required. Please add this domain to Firebase Console -> Authentication -> Authorized Domains.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in Firebase Console (Authentication -> Sign-in method -> Google).');
      } else {
        setError(`Google Auth (${code}): ${msg}`);
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
        width: '100%', maxWidth: '400px',
        background: 'rgba(30, 41, 59, 0.88)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '32px', padding: '40px 32px',
        color: '#fff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        textAlign: 'center', animation: 'fadeInUp 0.35s ease',
      }}>
        {/* App 3D Logo Header */}
        <div style={{
          width: 76, height: 76, borderRadius: '26px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #7c3aed 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '44px', color: '#fff', fontWeight: 900,
          boxShadow: '0 12px 30px -5px rgba(14, 165, 233, 0.5), inset 0 2px 3px rgba(255,255,255,0.4)',
          letterSpacing: '-1px', userSelect: 'none',
        }}>
          F
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Welcome to FLUX
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500, lineHeight: 1.5, marginBottom: '28px' }}>
          Build daily discipline, master deep focus, and lock in your goals with Firebase Cloud Sync.
        </p>

        {/* Error Diagnostics Box */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px', padding: '14px 16px', marginBottom: '20px',
            fontSize: '12px', color: '#fca5a5', fontWeight: 600, textAlign: 'left',
            lineHeight: 1.4,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Official Google In-App GSI Button Container */}
        <div 
          ref={googleBtnRef} 
          style={{ 
            display: 'flex', justifyContent: 'center', marginBottom: '14px', 
            minHeight: '44px' 
          }} 
        />

        {/* Primary Google Auth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%', padding: '16px', borderRadius: '20px',
            background: '#ffffff', color: '#0f172a', border: 'none',
            fontWeight: 800, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            boxShadow: '0 12px 30px -5px rgba(255, 255, 255, 0.3)',
            transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
            opacity: loading ? 0.7 : 1, marginBottom: '14px',
          }}
        >
          {loading ? (
            <span>Authenticating with Google...</span>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Guest Access Button */}
        <button
          onClick={() => {
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
          }}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s ease', fontFamily: 'Outfit, sans-serif',
          }}
        >
          <span>Continue as Guest ⚡</span>
        </button>

        {/* Security Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          marginTop: '24px', fontSize: '11px', color: '#64748b', fontWeight: 600,
        }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span>Protected by Firebase &amp; Google Identity Security</span>
        </div>
      </div>
    </div>
  );
}
