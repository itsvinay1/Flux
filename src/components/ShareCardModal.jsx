import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Share2, Flame, Award, Clock, Sparkles, Copy, Check } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import RenderAvatar from '../components/Avatar';

export default function ShareCardModal({ onClose }) {
  const userName = useStore((s) => s.userName);
  const userAvatar = useStore((s) => s.userAvatar);
  const streak = useStore((s) => s.streak);
  const points = useStore((s) => s.points);
  const totalFocusMinutes = useStore((s) => s.totalFocusMinutes);
  const getLevelName = useStore((s) => s.getLevelName);

  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  const totalHours = (totalFocusMinutes / 60).toFixed(1);
  const levelName = getLevelName();

  const handleShare = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toJpeg(cardRef.current, { quality: 0.95, cacheBust: true, pixelRatio: 2.5 });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `FLUX-Streak-${streak}Days.jpg`, { type: 'image/jpeg' });

      // Native Web / Mobile Share
      if (navigator.share) {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `FLUX Streak: ${streak} Days`,
            text: `Building real focus and discipline on FLUX. Current streak: ${streak} days! #FluxFocus #Discipline`,
            files: [file],
          });
          showToast('Shared Story Card!', 'check');
          setDownloading(false);
          return;
        } else {
          // Fallback share text with URL
          await navigator.share({
            title: `FLUX Streak: ${streak} Days`,
            text: `Building real focus and discipline on FLUX. Current streak: ${streak} days (${totalHours}h focused). Join me on FLUX!`,
            url: window.location.origin,
          });
          showToast('Shared link to FLUX', 'check');
          setDownloading(false);
          return;
        }
      }

      // Fallback Direct JPEG Download
      const link = document.createElement('a');
      link.download = `FLUX-Streak-${streak}Days.jpg`;
      link.href = dataUrl;
      link.click();
      showToast('Story Card saved to gallery', 'check');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share action failed:', err);
        showToast('Saved to device', 'check');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const text = `I'm on a ${streak}-day focus streak on FLUX with ${points} points earned and ${totalHours}h of deep study. Check out FLUX!`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Streak stats copied to clipboard!', 'check');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Could not copy to clipboard', 'alert');
    }
  };

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overscrollBehavior: 'none',
        touchAction: 'none',
      }} 
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          maxHeight: '94dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Header Bar */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#38bdf8" />
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>Share Progress</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff',
              border: 'none', borderRadius: '10px', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 9:16 Instagram / WhatsApp Story Card */}
        <div
          ref={cardRef}
          style={{
            width: '100%',
            aspectRatio: '9/16',
            maxHeight: '58vh',
            background: 'linear-gradient(165deg, #070d19 0%, #0f1e36 45%, #082f49 100%)',
            borderRadius: '24px',
            padding: '22px 20px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: '0 24px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(14, 165, 233, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div style={{
            position: 'absolute', top: '-20%', right: '-20%',
            width: '180px', height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Top Branding Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '9px',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '14px', color: '#fff',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
              }}>
                F
              </div>
              <span style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '1px', color: '#f8fafc' }}>FLUX</span>
            </div>
            <span style={{
              fontSize: '10px',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: '#38bdf8',
              padding: '4px 9px',
              borderRadius: '8px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {levelName}
            </span>
          </div>

          {/* Center Hero Streak Section */}
          <div style={{ textAlign: 'center', margin: '4px 0', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(249, 115, 22, 0.12)', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '5px 12px', borderRadius: '12px', marginBottom: '8px' }}>
              <Flame size={15} color="#fb923c" fill="#fb923c" />
              <span style={{ fontSize: '11px', color: '#fdba74', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Daily Discipline
              </span>
            </div>
            <div style={{
              fontSize: '44px',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-1.5px',
              background: 'linear-gradient(180deg, #ffffff 30%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {streak} DAYS
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginTop: '6px' }}>
              Unbroken Focus Streak
            </div>
          </div>

          {/* User Info & Stats Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '18px',
            padding: '14px 16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '12px',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.2)'
              }}>
                <RenderAvatar avatar={userAvatar} name={userName} size={38} fontSize="18px" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userName}
                </div>
                <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700 }}>
                  Active Focus Journey
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Award size={12} color="#38bdf8" />
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>XP Points</span>
                </div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#38bdf8' }}>{points}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Clock size={12} color="#34d399" />
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Focus Time</span>
                </div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#34d399' }}>{totalHours}h</div>
              </div>
            </div>
          </div>

          {/* Footer Call to Action */}
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', fontWeight: 600, position: 'relative', zIndex: 1 }}>
            Track daily syllabus &amp; deep work on <strong style={{ color: '#e2e8f0' }}>FLUX</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
          <button
            onClick={handleShare}
            disabled={downloading}
            className="btn btn-primary"
            style={{
              flex: 2,
              padding: '13px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 800,
              boxShadow: '0 6px 20px rgba(14,165,233,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Share2 size={17} /> {downloading ? 'Preparing...' : 'Share to WhatsApp & Stories'}
          </button>
          
          <button
            onClick={handleCopyLink}
            style={{
              flex: 1,
              padding: '13px',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 700,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
