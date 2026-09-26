import React, { useRef, useState } from 'react';
import { Download, X, Share2 } from 'lucide-react';
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
      
      // Native Android / Web Share API support
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

      // Fallback Direct JPEG Download
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
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', overflowY: 'auto',
      }} 
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '100%', maxWidth: '320px', maxHeight: '92vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Header Bar with Close */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>Share Streak Story</span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              border: 'none', borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 9:16 Instagram Story Card - Compact Responsive Fit */}
        <div
          ref={cardRef}
          style={{
            width: '100%', aspectRatio: '9/16', maxHeight: '56vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            borderRadius: '24px', padding: '20px 18px',
            color: '#fff', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Top Branding */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '8px',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '13px', color: '#fff',
              }}>
                F
              </div>
              <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.8px' }}>FLUX</span>
            </div>
            <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>
              {levelName}
            </span>
          </div>

          {/* Main Hero Streak */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <div style={{ fontSize: '38px', marginBottom: '2px' }}>🔥</div>
            <div style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1, letterSpacing: '-1.5px', color: '#fff' }}>
              {streak} DAYS
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '6px' }}>
              Unstoppable Streak
            </div>
          </div>

          {/* User Info & Stats */}
          <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: '18px', padding: '14px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                {userAvatar}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Building discipline daily</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#38bdf8' }}>{points}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Points Earned</div>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#a7f3d0' }}>{totalHours}h</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Total Focus</div>
              </div>
            </div>
          </div>

          {/* Footer Call to Action */}
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
            Join the focus movement · <strong style={{ color: '#fff' }}>#FluxApp</strong>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn btn-primary w-full"
          style={{ padding: '13px', borderRadius: '16px', fontSize: '14px', fontWeight: 800, boxShadow: '0 6px 20px rgba(14,165,233,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Share2 size={18} /> {downloading ? 'Generating Image...' : 'Share / Save Story Image'}
        </button>
      </div>
    </div>
  );
}
