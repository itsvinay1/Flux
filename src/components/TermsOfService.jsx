import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

export default function TermsOfService({ onClose }) {
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
              Terms of Service
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
          <FileText size={18} />
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
            title: '1. Agreement to Terms',
            body: 'By downloading, installing, or accessing the FLUX application, you agree to be bound by these Terms of Service. If you do not agree to these terms, discontinue use of the application.',
          },
          {
            title: '2. User Accounts and Eligibility',
            body: 'You must be at least 13 years old to use FLUX. To maintain a safe and verified community, account registration strictly requires a valid @gmail.com email address. You are responsible for safeguarding your credentials.',
          },
          {
            title: '3. Acceptable Use',
            body: 'You agree to use FLUX solely for personal study and habit development. You will not attempt to exploit, reverse engineer, tamper with leaderboard points, or submit automated artificial focus logs.',
          },
          {
            title: '4. Content Ownership',
            body: 'You retain full ownership of all custom notes, journal reflections, and personal tasks logged in FLUX. We claim no ownership over your personal data.',
          },
          {
            title: '5. Community Leaderboard Rules',
            body: 'Leaderboard points reflect actual focus sessions and completed milestone tasks. We reserve the right to reset streaks or ban accounts found manipulating leaderboard metrics with automated tools.',
          },
          {
            title: '6. Disclaimer of Warranties',
            body: 'FLUX is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted or faultless service.',
          },
          {
            title: '7. Limitation of Liability',
            body: 'In no event shall FLUX or its creators be liable for indirect, incidental, or consequential damages resulting from your use of the application.',
          },
          {
            title: '8. Modifications to Service',
            body: 'We reserve the right to modify or discontinue features at any time. Continued use following changes signifies acceptance of the revised Terms.',
          },
          {
            title: '9. Contact Information',
            body: 'For questions regarding these Terms, contact us directly at: flux.app.support@gmail.com',
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
