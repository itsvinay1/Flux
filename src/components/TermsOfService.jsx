import React from 'react';
import { X, FileText } from 'lucide-react';

export default function TermsOfService({ onClose }) {
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
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>Terms of Service</h2>
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
            { title: '1. Acceptance of Terms', body: 'By downloading, installing, or using the FLUX app, you agree to be bound by these Terms of Service. If you do not agree, please uninstall the app and discontinue use.' },
            { title: '2. Eligibility', body: 'You must be at least 13 years old to use FLUX. By using the app you represent that you are 13 or older. Users between 13 and 18 must have parental consent.' },
            { title: '3. Account & Registration', body: 'A valid @gmail.com email address is required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.' },
            { title: '4. Acceptable Use', body: 'You agree not to misuse FLUX. Prohibited activities include: (a) attempting to gain unauthorised access to any server or database; (b) uploading malicious files; (c) using the app to harass, defame, or intimidate others; (d) manipulating leaderboard data through automated bots or scripts.' },
            { title: '5. User Content', body: 'Any content you create within FLUX (journal entries, goals, notes) remains your property. By using cloud sync, you grant FLUX a limited, non-exclusive licence to store and process that content solely for the purpose of providing the service.' },
            { title: '6. Leaderboard & Community', body: 'The leaderboard displays your display name, XP points, and streak count to other authenticated users. Participation is automatic upon signing in. You may opt out by using Guest Mode, in which case your data will not appear on the leaderboard.' },
            { title: '7. Intellectual Property', body: 'All FLUX branding, design, code, and content (excluding user-generated content) is owned by FLUX and protected by applicable intellectual property laws. You may not copy, modify, or distribute our proprietary assets.' },
            { title: '8. Service Availability', body: 'FLUX is provided on an "as is" basis. We do not guarantee uninterrupted or error-free service. We reserve the right to modify, suspend, or discontinue the service at any time without notice.' },
            { title: '9. Limitation of Liability', body: 'To the maximum extent permitted by law, FLUX shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service.' },
            { title: '10. Termination', body: 'We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or abuse the leaderboard system.' },
            { title: '11. Changes to Terms', body: 'We may update these Terms at any time. Continued use of FLUX after changes constitutes acceptance of the revised Terms.' },
            { title: '12. Governing Law', body: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.' },
            { title: '13. Contact', body: 'For questions about these Terms, contact us at: flux.app.support@gmail.com' },
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
