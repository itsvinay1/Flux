import React from 'react';
import { X, Shield } from 'lucide-react';

export default function PrivacyPolicy({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,16,30,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: '28px 28px 0 0',
          position: 'absolute', bottom: 0, left: 0, right: 0,
          maxWidth: 480, margin: '0 auto',
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>Privacy Policy</h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Last updated: September 2026</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: 99, padding: 8, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px 40px', fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', WebkitOverflowScrolling: 'touch' }}>
          {[
            { title: '1. Data We Collect', body: 'FLUX collects only the data you voluntarily provide: your display name, email address, and profile photo (from Google Sign-In). We also store app-generated data such as streak counts, focus session logs, journal entries, and goal roadmaps entirely on your device using localStorage. None of this data is transmitted to third-party advertising networks.' },
            { title: '2. How We Use Your Data', body: 'Your data is used exclusively to power the FLUX experience: tracking streaks, computing leaderboard rankings, personalising the AI coach responses, and syncing your progress across sessions. We do not sell, rent, or share your personal data with any third party.' },
            { title: '3. Firebase & Google Services', body: 'FLUX uses Google Firebase for authentication, cloud backup of your progress data, and the leaderboard. Firebase stores user data on Google Cloud servers in accordance with Google\'s privacy policy (policies.google.com/privacy). Only your UID, display name, XP points, and streak count are stored in the shared Firestore leaderboard collection.' },
            { title: '4. Local Storage', body: 'The majority of your data (journal entries, focus sessions, syllabus progress, todos) is stored locally on your device in browser localStorage. It never leaves your device unless you explicitly have an active Firebase sync session.' },
            { title: '5. Gmail Restriction', body: 'To prevent ghost accounts and maintain community quality, only verified @gmail.com addresses are accepted for registration. No disposable or temporary email domains are permitted.' },
            { title: '6. Data Deletion', body: 'You can delete all your data at any time by navigating to Profile → Danger Zone → Delete Account & All Data. This action is irreversible and immediately removes all your local and cloud data.' },
            { title: '7. Children\'s Privacy', body: 'FLUX is not directed at children under 13 years of age. We do not knowingly collect personal information from children.' },
            { title: '8. Analytics', body: 'FLUX uses Firebase Analytics (opt-in only) to understand aggregate app usage patterns. No personally identifiable information is included in analytics events. Analytics is enabled only after explicit user consent.' },
            { title: '9. Changes to this Policy', body: 'We may update this Privacy Policy periodically. Continued use of FLUX after changes constitutes acceptance. We will notify you of significant changes through an in-app notice.' },
            { title: '10. Contact', body: 'For any privacy concerns, reach us at: flux.app.support@gmail.com' },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{section.title}</h3>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
