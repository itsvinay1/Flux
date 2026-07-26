import React, { useState } from 'react';
import { Target, Clock, Sparkles, ArrowRight, Check, Zap } from 'lucide-react';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';

const GOALS = [
  { id: 'deep_work', emoji: '🧠', title: 'Master Deep Work', desc: 'Eliminate phone distraction & lock into study/work blocks.' },
  { id: 'daily_habits', emoji: '⚡', title: 'Build Daily Consistency', desc: 'Create unbreakable morning & evening routines.' },
  { id: 'dopamine_detox', emoji: '🧘', title: 'Dopamine Detox', desc: 'Cut doom-scrolling, social media, & brain fog.' },
  { id: 'fitness_mindset', emoji: '💪', title: 'Iron Discipline & Fitness', desc: 'Track daily workouts, meditation, & healthy habits.' },
];

const TARGET_MINUTES = [
  { label: '15 min / day', val: 15, sub: 'Light Start' },
  { label: '30 min / day', val: 30, sub: 'Balanced' },
  { label: '60 min / day', val: 60, sub: 'Pro Focus' },
  { label: '120+ min / day', val: 120, sub: 'Beast Mode' },
];

const AVATAR_OPTIONS = ['⚡', '🚀', '🔥', '🧠', '💎', '🦁', '🌊', '⭐'];

export default function OnboardingModal({ onComplete }) {
  const updateProfile = useStore((s) => s.updateProfile);

  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0]);
  const [targetMin, setTargetMin] = useState(30);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('⚡');

  const handleFinish = () => {
    const finalName = userName.trim() || 'Flux User';
    
    // 1. Create starter goal with initial milestones based on quiz answers
    const starterGoal = {
      title: selectedGoal.title,
      emoji: selectedGoal.emoji,
      description: selectedGoal.desc,
      totalDays: 30,
      completedDays: 1,
    };

    const starterMilestones = [
      { id: `m1_${Date.now()}`, title: `Morning Kickstart (5 min planning)`, time: '8:00 AM', duration: '5 min', completed: false, points: 10 },
      { id: `m2_${Date.now()}`, title: `Deep Focus Block (${targetMin} mins)`, time: '10:00 AM', duration: `${targetMin} min`, completed: false, points: targetMin },
      { id: `m3_${Date.now()}`, title: `Evening Reflection & Log`, time: '9:00 PM', duration: '10 min', completed: false, points: 15 },
    ];

    // 2. Add initial goal to store
    const addChallenge = useStore.getState().addChallenge;
    if (addChallenge) {
      addChallenge(starterGoal, starterMilestones);
    }

    // 3. Update Profile
    updateProfile({
      userName: finalName,
      userAvatar,
      userBio: `Goal: ${selectedGoal.title}`,
    });

    // 4. Mark Onboarding Complete
    localStorage.setItem('flux-onboarding-done', 'true');
    showToast(`Welcome aboard, ${finalName}! 🚀`, '✨');
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '32px',
        width: '100%', maxWidth: '420px',
        padding: '32px 28px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        position: 'relative', overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Progress Bar Top */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              flex: 1, height: '6px', borderRadius: '99px',
              background: s <= step ? 'var(--accent-sky)' : 'var(--glass-border)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        {/* STEP 1: SELECT GOAL */}
        {step === 1 && (
          <div>
            <div className="badge badge-sky mb-12">Step 1 of 3</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              What is your primary focus?
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', fontWeight: 500 }}>
              FLUX will adapt your roadmap and AI coach based on this.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {GOALS.map((g) => {
                const isSel = selectedGoal.id === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGoal(g)}
                    style={{
                      padding: '16px', borderRadius: '20px',
                      border: `2px solid ${isSel ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
                      background: isSel ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-card)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '28px' }}>{g.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{g.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>{g.desc}</div>
                    </div>
                    {isSel && <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} color="#fff" strokeWidth={3} />
                    </div>}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn btn-primary w-full"
              style={{ padding: '16px', borderRadius: '20px', fontSize: '16px' }}
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: SET DAILY FOCUS GOAL */}
        {step === 2 && (
          <div>
            <div className="badge badge-sky mb-12">Step 2 of 3</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Daily Focus Target
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', fontWeight: 500 }}>
              How many minutes of distraction-free focus will you commit to daily?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
              {TARGET_MINUTES.map((t) => {
                const isSel = targetMin === t.val;
                return (
                  <div
                    key={t.val}
                    onClick={() => setTargetMin(t.val)}
                    style={{
                      padding: '20px 16px', borderRadius: '20px', textAlign: 'center',
                      border: `2px solid ${isSel ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
                      background: isSel ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-card)',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: 800, color: isSel ? 'var(--accent-sky)' : 'var(--text-primary)' }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                      {t.sub}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                className="btn btn-ghost"
                style={{ borderRadius: '20px', padding: '16px 20px' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn btn-primary flex-1"
                style={{ padding: '16px', borderRadius: '20px', fontSize: '16px' }}
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CLAIM IDENTITY & AVATAR */}
        {step === 3 && (
          <div>
            <div className="badge badge-sky mb-12">Step 3 of 3</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Claim Your Profile
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 500 }}>
              Set your name & avatar to begin your journey.
            </p>

            {/* Avatar Row */}
            <div className="section-label">Select Avatar</div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  onClick={() => setUserAvatar(av)}
                  style={{
                    width: '48px', height: '48px', borderRadius: '16px', fontSize: '24px',
                    border: `2px solid ${userAvatar === av ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
                    background: userAvatar === av ? 'rgba(14, 165, 233, 0.12)' : 'var(--bg-card)',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease',
                  }}
                >
                  {av}
                </button>
              ))}
            </div>

            {/* Name Input */}
            <div className="section-label">Your Name</div>
            <input
              className="flux-input mb-24"
              placeholder="e.g. Alex Vance"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={24}
              autoComplete="name"
              autoCorrect="off"
              spellCheck={false}
              style={{ fontSize: '16px' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(2)}
                className="btn btn-ghost"
                style={{ borderRadius: '20px', padding: '16px 20px' }}
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="btn btn-primary flex-1"
                style={{ padding: '16px', borderRadius: '20px', fontSize: '16px' }}
              >
                Start Journey 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
