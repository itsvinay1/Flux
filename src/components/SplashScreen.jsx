import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true);
      const finishTimer = setTimeout(() => {
        onFinish && onFinish();
      }, 500); // 500ms fade transition
      return () => clearTimeout(finishTimer);
    }, 2200); // Display for 2.2 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(circle at 50% 40%, #1e1b4b 0%, #0f172a 70%, #090d16 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        transform: fadingOut ? 'scale(1.05)' : 'scale(1)',
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      {/* Background Ambient Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'pulseGlow 2.5s infinite alternate ease-in-out',
        }}
      />

      {/* 3D App Icon Container */}
      <div
        style={{
          position: 'relative',
          width: '100px',
          height: '100px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #7c3aed 100%)',
          boxShadow: `
            0 20px 40px -10px rgba(14, 165, 233, 0.6),
            0 10px 20px -5px rgba(124, 58, 237, 0.5),
            inset 0 2px 3px rgba(255, 255, 255, 0.4),
            inset 0 -4px 6px rgba(0, 0, 0, 0.3)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          animation: 'floatIcon 2s ease-in-out infinite alternate',
          transform: 'perspective(500px) rotateX(10deg)',
        }}
      >
        {/* Symbol 'F' */}
        <span
          style={{
            fontSize: '56px',
            fontWeight: 900,
            color: '#ffffff',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            letterSpacing: '-2px',
            textShadow: '0 4px 12px rgba(0,0,0,0.4)',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          F
        </span>
      </div>

      {/* App Name 'FLUX' */}
      <h1
        style={{
          fontSize: '38px',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '6px',
          margin: 0,
          fontFamily: "'Outfit', 'Inter', sans-serif",
          textShadow: '0 4px 20px rgba(14, 165, 233, 0.5)',
        }}
      >
        FLUX
      </h1>

      {/* Sub-tagline */}
      <p
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#38bdf8',
          letterSpacing: '4px',
          marginTop: '10px',
          marginBottom: '32px',
          textTransform: 'uppercase',
          opacity: 0.9,
        }}
      >
        FOCUS • BUILD • LEVEL UP
      </p>

      {/* Sleek Progress Bar */}
      <div
        style={{
          width: '140px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #818cf8)',
            borderRadius: '10px',
            animation: 'splashLoad 2s ease-in-out forwards',
          }}
        />
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes splashLoad {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
        @keyframes floatIcon {
          0% { transform: perspective(500px) rotateX(10deg) translateY(0px); }
          100% { transform: perspective(500px) rotateX(5deg) translateY(-8px); }
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
