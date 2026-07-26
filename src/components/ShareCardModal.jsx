import React, { useRef, useState } from 'react';
import { Download, X } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';

export default function ShareCardModal({ onClose }) {
  const userName = useStore((s) => s.userName);
  const userAvatar = useStore((s) => s.userAvatar);
  const streak = useStore((s) => s.streak);
  const points = useStore((s) => s.points);
  const totalFocusMinutes = useStore((s) => s.totalFocusMinutes);
  const getLevelName = useStore((s) => s.getLevelName);

  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const totalHours = (totalFocusMinutes / 60).toFixed(1);
  const levelName = getLevelName();

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toJpeg(cardRef.current, { quality: 0.95, cacheBust: true, pixelRatio: 2 });
      
      // Native Android Web Share API support
      if (navigator.share && navigator.canShare) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `FLUX-Streak-${streak}Days.jpg`, { type: 'image/jpeg' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `FLUX Streak: ${streak} Days!`,
            text: `Crushing goals daily on FLUX! 🔥 My streak is ${streak} days!`,
            files: [file],
          });
          showToast('Shared Story Card! 🚀', '✨');
          return;
        }
      }

      // Fallback Direct JPEG Download for Android / Web
      const link = document.createElement('a');
      link.download = `FLUX-Streak-${streak}Days.jpg`;
      link.href = dataUrl;
      link.click();
      showToast('JPEG Story Card saved! 📸', '✨');
    } catch (err) {
      console.error('Failed to generate JPEG image:', err);
      showToast('Error generating story image', '⚠️');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '100%', maxWidth: '380px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            alignSelf: 'flex-end', background: 'rgba(255,255,255,0.2)', color: '#fff',
            border: 'none', borderRadius: '50%', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* 9:16 Instagram Story Card */}
        <div
          ref={cardRef}
          style={{
            width: '100%', aspectRatio: '9/16',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            borderRadius: '32px', padding: '36px 28px',
            color: '#fff', display: 'flex', flexDirection: 'column',
            justify: 'space-between', border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Top Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '10px',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '16px', color: '#fff',
              }}>
                F
              </div>
              <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '1px' }}>FLUX</span>
            </div>
            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 99, fontWeight: 700 }}>
              {levelName}
            </span>
          </div>

          {/* Main Hero Streak */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div style={{ fontSize: '54px', marginBottom: '8px' }}>🔥</div>
            <div style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1, letterSpacing: '-2px', color: '#fff' }}>
              {streak} DAYS
            </div>
            <div style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px' }}>
              Unstoppable Streak
            </div>
          </div>

          {/* User Info & Stats */}
          <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '20px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                {userAvatar}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>{userName}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Building discipline daily</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8' }}>{points}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Points Earned</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#a7f3d0' }}>{totalHours}h</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Total Focus</div>
              </div>
            </div>
          </div>

          {/* Footer Call to Action */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
            Join the focus movement · <strong style={{ color: '#fff' }}>#FluxApp</strong>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn btn-primary w-full"
          style={{ padding: '16px', borderRadius: '20px', fontSize: '16px', boxShadow: '0 8px 24px rgba(14,165,233,0.4)' }}
        >
          <Download size={20} /> {downloading ? 'Generating Image...' : 'Save Story Image'}
        </button>
      </div>
    </div>
  );
}
