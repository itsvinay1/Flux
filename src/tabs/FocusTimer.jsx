import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, Plus, CheckCircle, Lock, Settings2, Volume2, CloudRain, Zap, Radio, Music2, Trophy } from 'lucide-react';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';
import { audioEngine } from '../utils/ambientAudio';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

const MODES = [
  { id: 'pomodoro', label: 'Pomodoro', minutes: 25 },
  { id: 'deep', label: 'Deep Work', minutes: 50 },
  { id: 'short', label: 'Break', minutes: 5 },
];

// Built-in focus tracks
const FOCUS_TRACKS = [
  { id: 'off',     label: 'Off',       src: null,                icon: 'off'   },
  { id: 'track1',  label: 'Focus 1',   src: '/audio/focus_1.mp3', icon: 'music' },
  { id: 'track2',  label: 'Focus 2',   src: '/audio/focus_2.mp3', icon: 'music' },
  { id: 'track3',  label: 'Focus 3',   src: '/audio/focus_3.mp3', icon: 'music' },
  { id: 'track4',  label: 'Focus 4',   src: '/audio/focus_4.mp3', icon: 'music' },
  { id: 'track5',  label: 'Focus 5',   src: '/audio/focus_5.mp3', icon: 'music' },
];

function CircularTimer({ progress, seconds, isRunning }) {
  const size = 310;
  const strokeWidth = 16;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashOffset = circumference - (progress / 100) * circumference;

  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const showDays = days > 0;
  const showHours = hours > 0 || days > 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      {isRunning && (
        <>
          <div style={{
            position: 'absolute',
            inset: -22,
            borderRadius: '50%',
            border: '2px solid rgba(14,165,233,0.25)',
            animation: 'pulseRing 2.5s ease infinite',
          }} />
          <div style={{
            position: 'absolute',
            inset: -12,
            borderRadius: '50%',
            border: '1.5px solid rgba(14,165,233,0.15)',
            animation: 'pulseRing 2.5s ease 0.7s infinite',
          }} />
        </>
      )}

      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-card-md)',
        border: '1px solid var(--glass-border)',
      }} />

      <svg
        width={size} height={size}
        style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--bg-secondary)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--accent-sky)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s linear', filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.4))' }}
        />
      </svg>

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 2, padding: '20px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justify: 'center', gap: '4px',
          fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--text-primary)',
          letterSpacing: '-1.5px', lineHeight: 1,
        }}>
          {showDays && (
            <><span style={{ fontSize: '52px' }}>{String(days).padStart(2, '0')}</span><span style={{ fontSize: '22px', opacity: 0.5, marginRight: '4px' }}>d</span></>
          )}
          {showHours && (
            <><span style={{ fontSize: '52px' }}>{String(hours).padStart(2, '0')}</span><span style={{ fontSize: '22px', opacity: 0.5, marginRight: '4px' }}>h</span></>
          )}
          <span style={{ fontSize: showHours ? '46px' : '64px' }}>{String(minutes).padStart(2, '0')}</span>
          <span style={{ fontSize: '22px', opacity: 0.5, margin: '0 2px' }}>:</span>
          <span style={{ fontSize: showHours ? '46px' : '64px' }}>{String(secs).padStart(2, '0')}</span>
        </div>
        <span style={{
          marginTop: '12px', fontSize: '11px', fontWeight: 700,
          color: isRunning ? 'var(--accent-sky)' : 'var(--text-muted)',
          letterSpacing: '1.5px', textTransform: 'uppercase',
          fontFamily: 'Outfit, sans-serif',
        }}>
          {isRunning ? 'In Focus' : 'Ready'}
        </span>
      </div>
    </div>
  );
}

export default function FocusTimer() {
  const addFocusSession = useStore((s) => s.addFocusSession);
  const incrementDistraction = useStore((s) => s.incrementDistraction);
  const resetDistraction = useStore((s) => s.resetDistraction);
  const currentDistractions = useStore((s) => s.currentDistractions);
  const isPremium = useStore((s) => s.isPremium);

  const [selectedMode, setSelectedMode] = useState(0);
  const [customDays, setCustomDays] = useState(0);
  const [customHours, setCustomHours] = useState(0);
  const [customMins, setCustomMins] = useState(25);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [activeSound, setActiveSound] = useState('off');
  const audioRef = useRef(null);

  useEffect(() => {
    if (showCustomModal) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [showCustomModal]);

  const [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60);
  const [totalSeconds, setTotalSeconds] = useState(MODES[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const intervalRef = useRef(null);

  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  const handleModeSelect = (idx) => {
    if (isRunning) return;
    setSelectedMode(idx);
    const secs = MODES[idx].minutes * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setSessionComplete(false);
    resetDistraction();
  };

  const handleApplyCustomTime = () => {
    const d = Math.max(0, Number(customDays) || 0);
    const h = Math.max(0, Number(customHours) || 0);
    const m = Math.max(0, Number(customMins) || 0);
    const totalSec = (d * 86400) + (h * 3600) + (m * 60);

    if (totalSec <= 0) {
      showToast('Please set at least 1 minute', 'alert');
      return;
    }

    const label = d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
    MODES[3] = { id: 'custom', label: 'Custom', minutes: Math.round(totalSec / 60) };

    setSelectedMode(3);
    setTotalSeconds(totalSec);
    setSecondsLeft(totalSec);
    setSessionComplete(false);
    resetDistraction();
    setShowCustomModal(false);

    showToast(`Timer set to ${label}`, 'check');
  };

  const handleComplete = useCallback(() => {
    try {
      setIsRunning(false);
      setSessionComplete(true);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const minsCompleted = Math.max(1, Math.round(totalSeconds / 60));
      addFocusSession(minsCompleted, currentDistractions);
      showToast(`Session complete! +${minsCompleted} points earned`, 'success');
    } catch (err) {
      console.warn('[FocusTimer] Completion notice:', err);
    }
  }, [totalSeconds, currentDistractions, addFocusSession]);

  const handleStart = () => {
    if (sessionComplete) { handleReset(); return; }
    setIsRunning((p) => !p);
  };

  const handleReset = () => {
    try {
      setIsRunning(false);
      setSecondsLeft(totalSeconds);
      setSessionComplete(false);
      resetDistraction();
      if (intervalRef.current) clearInterval(intervalRef.current);
      audioEngine.stopAll();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch (err) {
      console.warn('[FocusTimer] Reset notice:', err);
    }
  };

  const handleDistraction = () => {
    incrementDistraction();
    showToast('Urge logged. Stay focused.', 'info');
  };

  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    try {
      audioEngine.setMasterVolume(volume);
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    } catch (e) {}
  }, [volume]);

  // Switch track when selection changes
  useEffect(() => {
    const track = FOCUS_TRACKS.find((t) => t.id === activeSound);
    if (!track || !track.src) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioEngine.stopAll();
      return;
    }
    if (audioRef.current) {
      audioRef.current.src = track.src;
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
      if (isRunning) {
        audioRef.current.play().catch(() => {});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSound]);

  useEffect(() => {
    if (isRunning) {
      try {
        const track = FOCUS_TRACKS.find((t) => t.id === activeSound);
        if (track && track.src && audioRef.current) {
          audioRef.current.volume = volume;
          audioRef.current.play().catch(() => {});
        }
      } catch (e) {}

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setTimeout(() => {
              try {
                audioEngine.stopAll();
                if (audioRef.current) audioRef.current.pause();
                handleComplete();
              } catch (e) {}
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      try { audioEngine.stopAll(); } catch (e) {}
      if (audioRef.current) audioRef.current.pause();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      try { audioEngine.stopAll(); } catch (e) {}
      if (audioRef.current) audioRef.current.pause();
    };
  }, [isRunning, activeSound, handleComplete]);

  return (
    <div className="tab-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '120px' }}>
      {/* Single shared audio element for built-in tracks */}
      <audio ref={audioRef} preload="auto" />

      <div className="sticky-screen-header" style={{ width: '100%' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '19px', fontWeight: 800 }}>Focus &amp; Flow</h1>
          <p className="page-subtitle" style={{ fontSize: '11px', margin: 0 }}>Distraction-free focus timer</p>
        </div>
      </div>

      {/* Mode Selector + Custom Button */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', width: '100%', overflowX: 'auto', paddingBottom: '4px' }}>
        {MODES.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => handleModeSelect(idx)}
            style={{
              flex: 1, minWidth: '78px', padding: '10px 6px',
              fontSize: '12px', fontWeight: 700,
              background: selectedMode === idx ? 'var(--accent-sky)' : 'var(--bg-card)',
              border: `1.5px solid ${selectedMode === idx ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
              borderRadius: '16px',
              color: selectedMode === idx ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              boxShadow: selectedMode === idx ? 'var(--shadow-button-sky)' : 'var(--shadow-card)',
              transition: 'all 0.2s ease', lineHeight: 1.4,
            }}
          >
            {m.label}<br />
            <span style={{ fontWeight: 500, opacity: 0.8 }}>{m.minutes >= 60 ? `${(m.minutes/60).toFixed(1)}h` : `${m.minutes}m`}</span>
          </button>
        ))}

        <button
          onClick={() => setShowCustomModal(true)}
          style={{
            flex: 1, minWidth: '85px', padding: '10px 6px',
            fontSize: '12px', fontWeight: 700,
            background: selectedMode === 3 ? 'var(--accent-sky)' : 'var(--bg-card)',
            border: `1.5px solid ${selectedMode === 3 ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
            borderRadius: '14px',
            color: selectedMode === 3 ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            boxShadow: selectedMode === 3 ? 'var(--shadow-button-sky)' : 'var(--shadow-card)',
            transition: 'all 0.2s ease', lineHeight: 1.4,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Settings2 size={12} /> {MODES[3] ? MODES[3].label : 'Custom'}
          </div>
          <span style={{ fontWeight: 500, opacity: 0.8 }}>
            {MODES[3] ? `${MODES[3].minutes}m` : 'Set Time'}
          </span>
        </button>
      </div>

      {/* Custom Time Modal */}
      {showCustomModal && createPortal(
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            overscrollBehavior: 'none',
            touchAction: 'none',
          }}
          onClick={() => setShowCustomModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', borderRadius: '24px', padding: '28px 24px',
              width: '100%', maxWidth: '380px', boxShadow: 'var(--shadow-card-md)',
              animation: 'slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
              touchAction: 'pan-y',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Set Custom Duration
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              <div>
                <div className="section-label">Days</div>
                <input
                  className="flux-input text-center"
                  type="number"
                  min="0" max="30"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                />
              </div>
              <div>
                <div className="section-label">Hours</div>
                <input
                  className="flux-input text-center"
                  type="number"
                  min="0" max="23"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                />
              </div>
              <div>
                <div className="section-label">Minutes</div>
                <input
                  className="flux-input text-center"
                  type="number"
                  min="0" max="59"
                  value={customMins}
                  onChange={(e) => setCustomMins(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowCustomModal(false)}
                className="btn btn-ghost flex-1"
                style={{ borderRadius: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomTime}
                className="btn btn-primary flex-1"
                style={{ borderRadius: '14px' }}
              >
                Apply Timer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Large Comfy Timer Ring */}
      <div style={{ marginBottom: '36px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <CircularTimer progress={progress} seconds={secondsLeft} isRunning={isRunning} />
      </div>

      {/* Timer Controls */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '32px' }}>
        {/* Reset */}
        <button
          id="btn-timer-reset"
          onClick={handleReset}
          style={{
            width: 56, height: 56, borderRadius: '20px',
            background: 'var(--bg-card)', border: '1.5px solid var(--glass-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
            boxShadow: 'var(--shadow-card)', transition: 'all 0.15s ease',
          }}
        >
          <RotateCcw size={22} />
        </button>

        {/* Play/Pause */}
        <button
          id="btn-timer-start"
          onClick={handleStart}
          style={{
            width: 88, height: 88, borderRadius: '28px',
            background: isRunning ? '#fff7ed' : 'var(--accent-sky)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isRunning ? '0 8px 24px rgba(249,115,22,0.2)' : 'var(--shadow-button-sky)',
            color: isRunning ? '#f97316' : '#fff',
            transition: 'all 0.25s ease',
          }}
        >
          {sessionComplete
            ? <CheckCircle size={36} />
            : isRunning
              ? <Pause size={36} fill="currentColor" />
              : <Play size={36} fill="currentColor" style={{ marginLeft: '4px' }} />
          }
        </button>

        {/* Distraction Logger */}
        <button
          id="btn-distraction"
          onClick={handleDistraction}
          disabled={!isRunning}
          style={{
            width: 56, height: 56, borderRadius: '20px',
            background: 'var(--bg-card)', border: '1.5px solid var(--glass-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isRunning ? 'pointer' : 'default',
            opacity: isRunning ? 1 : 0.4, color: '#f43f5e',
            boxShadow: 'var(--shadow-card)', position: 'relative',
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={22} strokeWidth={3} />
          {currentDistractions > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#f43f5e', color: '#fff',
              borderRadius: '50%', width: 20, height: 20,
              fontSize: '11px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--bg-card)',
            }}>
              {currentDistractions}
            </span>
          )}
        </button>
      </div>

      {/* Focus Music - Built-in Tracks */}
      <div className="card" style={{ width: '100%', padding: '18px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            <Volume2 size={16} color="var(--accent-sky)" /> Focus Music
          </div>
          <span style={{ fontSize: '10px', background: 'rgba(14,165,233,0.1)', color: '#0284c7', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
            100% Offline
          </span>
        </div>

        {/* Volume Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '12px' }}>
          <Volume2 size={14} color="var(--text-muted)" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent-sky)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', minWidth: '32px', textAlign: 'right' }}>
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Track selector - 6 buttons: Off + 5 tracks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
          {FOCUS_TRACKS.map((trk) => {
            const isActive = activeSound === trk.id;
            return (
              <button
                key={trk.id}
                onClick={() => {
                  setActiveSound(trk.id);
                  if (trk.id !== 'off') {
                    showToast(isRunning ? `Playing ${trk.label}` : `Selected ${trk.label}`, 'info');
                  }
                }}
                style={{
                  padding: '10px 2px',
                  borderRadius: '12px',
                  border: `1.5px solid ${isActive ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
                  background: isActive ? 'rgba(14,165,233,0.1)' : 'var(--bg-card)',
                  color: isActive ? 'var(--accent-sky)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '9px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {trk.id === 'off' ? <Volume2 size={14} /> : <Music2 size={14} />}
                {trk.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Complete Card */}
      {sessionComplete && (
        <div className="card card-emerald-tint text-center mt-16" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <Trophy size={42} color="var(--accent-sky)" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '6px' }}>Session Complete!</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>
            <strong style={{ color: '#059669' }}>+{Math.round(totalSeconds/60)} pts</strong> earned &bull;{' '}
            {currentDistractions === 0 ? 'Zero distractions logged' : `${currentDistractions} distractions logged`}
          </div>
          <button
            id="btn-new-session"
            onClick={handleReset}
            className="btn btn-dark w-full"
            style={{ borderRadius: '18px', padding: '14px' }}
          >
            Start New Session
          </button>
        </div>
      )}
    </div>
  );
}
