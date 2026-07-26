import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus, CheckCircle, Lock, Settings2, Volume2, CloudRain, Zap, Radio } from 'lucide-react';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';
import { audioEngine } from '../utils/ambientAudio';

const MODES = [
  { id: 'pomodoro', label: 'Pomodoro', minutes: 25 },
  { id: 'deep', label: 'Deep Work', minutes: 50 },
  { id: 'short', label: 'Break', minutes: 5 },
];

function CircularTimer({ progress, seconds, isRunning }) {
  const size = 310;
  const strokeWidth = 16;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashOffset = circumference - (progress / 100) * circumference;

  // Format into Day, Hour, Minute, Second
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const showDays = days > 0;
  const showHours = hours > 0 || days > 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      {/* Pulse rings when active */}
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

      {/* Comfy White/Card circular base */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-card-md)',
        border: '1px solid var(--glass-border)',
      }} />

      {/* SVG Progress Ring */}
      <svg
        width={size} height={size}
        style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--bg-secondary)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
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

      {/* Center Comfy Timer Display (Day, Hour, Min, Sec) */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 2, padding: '20px',
      }}>
        {/* Large Format Time */}
        <div style={{
          display: 'flex', alignItems: 'baseline', justify: 'center', gap: '4px',
          fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--text-primary)',
          letterSpacing: '-1.5px', lineHeight: 1,
        }}>
          {showDays && (
            <div style={{ display: 'flex', flexDir: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '32px' }}>{String(days).padStart(2, '0')}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>d</span>
            </div>
          )}
          {showDays && <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>:</span>}

          {showHours && (
            <div style={{ display: 'flex', flexDir: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: showDays ? '32px' : '42px' }}>{String(hours).padStart(2, '0')}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>h</span>
            </div>
          )}
          {showHours && <span style={{ fontSize: showDays ? '24px' : '32px', color: 'var(--text-muted)' }}>:</span>}

          <div style={{ display: 'flex', flexDir: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: showHours ? '40px' : '54px' }}>{String(minutes).padStart(2, '0')}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>m</span>
          </div>
          <span style={{ fontSize: showHours ? '28px' : '38px', color: 'var(--text-muted)' }}>:</span>

          <div style={{ display: 'flex', flexDir: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: showHours ? '40px' : '54px', color: 'var(--accent-sky)' }}>{String(secs).padStart(2, '0')}</span>
            <span style={{ fontSize: '10px', color: 'var(--accent-sky)', textTransform: 'uppercase', letterSpacing: '1px' }}>s</span>
          </div>
        </div>

        {/* Status Pill */}
        <div style={{
          marginTop: '16px',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          padding: '5px 14px',
          borderRadius: '99px',
          background: isRunning ? 'rgba(14, 165, 233, 0.12)' : 'var(--bg-secondary)',
          color: isRunning ? 'var(--accent-sky)' : 'var(--text-muted)',
          transition: 'all 0.3s ease',
        }}>
          {isRunning ? '⚡ Flow State Active' : '⏸️ Session Paused'}
        </div>
      </div>

      {/* Lock Badge */}
      {isRunning && (
        <div style={{
          position: 'absolute', top: 0, right: 12,
          background: 'var(--bg-card)', borderRadius: '16px', padding: '10px',
          boxShadow: 'var(--shadow-card)', border: '1px solid var(--glass-border)',
          animation: 'bounce 1s ease infinite alternate',
        }}>
          <Lock size={20} color="#f43f5e" />
        </div>
      )}
    </div>
  );
}

export default function FocusTimer() {
  const addFocusSession = useStore((s) => s.addFocusSession);
  const incrementDistraction = useStore((s) => s.incrementDistraction);
  const currentDistractions = useStore((s) => s.currentSessionDistractions);
  const resetDistraction = useStore((s) => s.resetDistraction);

  const [selectedMode, setSelectedMode] = useState(0);
  const [customDays, setCustomDays] = useState(0);
  const [customHours, setCustomHours] = useState(0);
  const [customMins, setCustomMins] = useState(45);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [activeSound, setActiveSound] = useState('off');

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
      showToast('Please set at least 1 minute! ⏱️', '⚠️');
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

    showToast(`Comfy timer set to ${label}! ⏱️`, '✨');
  };

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setSessionComplete(true);
    const minsCompleted = Math.max(1, Math.round(totalSeconds / 60));
    addFocusSession(minsCompleted, currentDistractions);
    showToast(`Session complete! +${minsCompleted} pts earned 🎉`, '🏆');
  }, [totalSeconds, currentDistractions, addFocusSession]);

  const handleStart = () => {
    if (sessionComplete) { handleReset(); return; }
    setIsRunning((p) => !p);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
    setSessionComplete(false);
    resetDistraction();
    clearInterval(intervalRef.current);
  };

  const handleDistraction = () => {
    incrementDistraction();
    showToast('Urge logged. Stay strong! 💪', '⚡');
  };

  useEffect(() => {
    if (isRunning) {
      // Automatically resume selected ambient sound when timer is running
      if (activeSound === 'flute') audioEngine.playFlute();
      if (activeSound === 'lofi') audioEngine.playLofi();
      if (activeSound === 'meditation') audioEngine.playMeditation();
      if (activeSound === 'rain') audioEngine.playRain();

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) { 
            clearInterval(intervalRef.current); 
            audioEngine.stopAll(); 
            handleComplete(); 
            return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Tightly tie audio to timer state: Stop audio immediately when timer pauses/stops
      clearInterval(intervalRef.current);
      audioEngine.stopAll();
    }

    return () => {
      clearInterval(intervalRef.current);
      audioEngine.stopAll();
    };
  }, [isRunning, activeSound, handleComplete]);

  return (
    <div className="tab-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '24px', paddingTop: '12px' }}>
        <h1 className="page-title">Focus & Flow</h1>
        <p className="page-subtitle">Comfy distraction-free focus environment</p>
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
            background: selectedMode === 3 ? 'var(--accent-violet)' : 'var(--bg-card)',
            border: `1.5px solid ${selectedMode === 3 ? 'var(--accent-violet)' : 'var(--glass-border)'}`,
            borderRadius: '16px',
            color: selectedMode === 3 ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            boxShadow: selectedMode === 3 ? 'var(--shadow-button-violet)' : 'var(--shadow-card)',
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
      {showCustomModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '28px', padding: '28px',
            width: '100%', maxWidth: '380px', boxShadow: 'var(--shadow-card-md)',
            animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Set Custom Comfy Duration
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
                style={{ borderRadius: '16px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomTime}
                className="btn btn-primary flex-1"
                style={{ borderRadius: '16px' }}
              >
                Apply Timer
              </button>
            </div>
          </div>
        </div>
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

      {/* Ambient Focus Sound Engine (Synthesized Offline Audio) */}
      <div className="card" style={{ width: '100%', padding: '18px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            <Volume2 size={16} color="var(--accent-sky)" /> Ambient Focus Audio
          </div>
          <span style={{ fontSize: '10px', background: 'rgba(14,165,233,0.1)', color: '#0284c7', padding: '3px 8px', borderRadius: 99, fontWeight: 700 }}>
            100% Offline
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {[
            { id: 'off', label: 'Off', icon: <Volume2 size={14} /> },
            { id: 'flute', label: '🪈 Flute', icon: <Radio size={14} /> },
            { id: 'lofi', label: '☕ Lo-Fi', icon: <Zap size={14} /> },
            { id: 'meditation', label: '🧘 432Hz', icon: <Zap size={14} /> },
            { id: 'rain', label: '🌧️ Rain', icon: <CloudRain size={14} /> },
          ].map((snd) => {
            const isActive = activeSound === snd.id;
            return (
              <button
                key={snd.id}
                onClick={() => {
                  setActiveSound(snd.id);
                  if (isRunning) {
                    audioEngine.stopAll();
                    if (snd.id === 'flute') audioEngine.playFlute();
                    if (snd.id === 'lofi') audioEngine.playLofi();
                    if (snd.id === 'meditation') audioEngine.playMeditation();
                    if (snd.id === 'rain') audioEngine.playRain();
                  }
                  if (snd.id !== 'off') {
                    showToast(isRunning ? `Playing ${snd.label} 🎧` : `Selected ${snd.label} (plays on start) 🎧`, '🎵');
                  }
                }}
                style={{
                  padding: '8px 2px',
                  borderRadius: '14px',
                  border: `1.5px solid ${isActive ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
                  background: isActive ? 'rgba(14,165,233,0.1)' : 'var(--bg-card)',
                  color: isActive ? 'var(--accent-sky)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '10px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  transition: 'all 0.2s ease',
                }}
              >
                {snd.icon}
                {snd.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Complete Card */}
      {sessionComplete && (
        <div className="card card-emerald-tint text-center mt-16" style={{ width: '100%' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '6px' }}>Session Complete!</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>
            <strong style={{ color: '#059669' }}>+{Math.round(totalSeconds/60)} pts</strong> earned •{' '}
            {currentDistractions === 0 ? '🎯 Perfect focus!' : `${currentDistractions} distractions logged`}
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
