import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

export default function PrivacyPolicy({ onClose }) {
  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        height: '100dvh',
        zIndex: 10000,
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        overscrollBehavior: 'none',
        touchAction: 'none',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Notch-safe Top Navigation Bar */}
      <div
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          paddingBottom: '14px',
          paddingLeft: '18px',
          paddingRight: '18px',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            aria-label="Back"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'background 0.15s ease',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 500 }}>
              Updated September 2026
            </p>
          </div>
        </div>

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'rgba(14, 165, 233, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-sky)',
          }}
        >
          <Shield size={18} />
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          padding: '24px 20px calc(40px + env(safe-area-inset-bottom, 20px))',
          maxWidth: 680,
          width: '100%',
          margin: '0 auto',
          fontSize: '14px',
          lineHeight: 1.75,
          color: 'var(--text-secondary)',
        }}
      >
        {[
          {
            title: '1. Overview',
            body: 'FLUX values your privacy. This policy details how your data is handled across our mobile and web applications. We follow strict data minimization standards, collecting only what is strictly necessary to provide the service.',
          },
          {
            title: '2. Information We Collect',
            body: 'When you create an account, we store your email address and display name. To protect against anonymous abuse and maintain account integrity, account registration requires a valid @gmail.com address. Your streaks, focus logs, syllabus completion records, and journal entries are saved locally on your device in browser localStorage.',
          },
          {
            title: '3. Cloud Synchronization',
            body: 'When logged in, your account UID, display name, level, streak count, and leaderboard points are synced to Google Firebase Firestore. Your personal notes and daily reflection entries remain on your device unless explicit cloud backup is activated.',
          },
          {
            title: '4. No Data Selling or Ad Tracking',
            body: 'We do not sell, rent, or trade your personal information. We do not use third-party ad networks, advertising trackers, or data broker analytics.',
          },
          {
            title: '5. Data Deletion and Portability',
            body: 'You have complete sovereignty over your data. You can delete your entire account, cloud records, and local storage at any time by navigating to Profile > Danger Zone > Delete Account & All Data. This action is instantaneous and irreversible.',
          },
          {
            title: '6. Children Privacy Protection',
            body: 'FLUX is intended for individuals aged 13 and older. We do not knowingly collect or solicit personal information from children under 13.',
          },
          {
            title: '7. Security Measures',
            body: 'All network transmissions utilize TLS 1.3 encryption. Firestore security rules strictly enforce authenticated user ownership over private documents.',
          },
          {
            title: '8. Policy Updates',
            body: 'We may periodically update this policy to reflect new capabilities. Any revisions will be reflected in-app and on our official website.',
          },
          {
            title: '9. Contact',
            body: 'For privacy inquiries or technical data requests, contact our team at: flux.app.support@gmail.com',
          },
        ].map((section) => (
          <div
            key={section.title}
            style={{
              marginBottom: '20px',
              padding: '18px 20px',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {section.title}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{section.body}</p>
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}
