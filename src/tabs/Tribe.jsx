import React, { useState } from 'react';
import { Flame, Crown, Users, Plus, Trash2, Copy, Sparkles, Check, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';
import { getRoadmapTemplate } from '../mockAI';
import RenderAvatar from '../components/Avatar';

// Community Curated Explore Roadmaps that users can copy
const EXPLORE_COMMUNITY_GOALS = [
  {
    id: 'exp_gate_2026',
    presetId: 'gate',
    emoji: '🎓',
    title: 'GATE 2026 Ranker Routine',
    author: 'Rahul S. (Rank 14)',
    streak: 84,
    description: 'Structured 4-step daily schedule for Engineering Maths, PYQs & Error analysis.',
    tags: ['GATE', 'Engineering', 'PYQ'],
  },
  {
    id: 'exp_neet_warriors',
    presetId: 'neet',
    emoji: '🩺',
    title: 'NEET 700+ Line-by-Line NCERT',
    author: 'Dr. Ananya P.',
    streak: 92,
    description: 'NCERT Biology intensive, Physics numerical drills & Chemistry mechanisms.',
    tags: ['NEET', 'Medical', 'NCERT'],
  },
  {
    id: 'exp_jee_air',
    presetId: 'jee',
    emoji: '🚀',
    title: 'IIT JEE Top 500 Strategy',
    author: 'Vikas M.',
    streak: 110,
    description: 'HC Verma Physics, Advanced Calculus & Organic Mechanism drills.',
    tags: ['IIT JEE', 'Maths', 'Physics'],
  },
  {
    id: 'exp_govt_upsc',
    presetId: 'govt',
    emoji: '🏛️',
    title: 'Govt Exams & Current Affairs',
    author: 'Priya K.',
    streak: 65,
    description: 'Quant speed drills, logical puzzles & daily current affairs reading.',
    tags: ['Govt Exams', 'Aptitude'],
  },
  {
    id: 'exp_deep_work',
    presetId: 'relax',
    emoji: '🧘',
    title: 'Mindful Stress-Free Flow',
    author: 'Kiran G.',
    streak: 45,
    description: 'Morning meditation, digital detox walk & evening reflection.',
    tags: ['Meditation', 'Focus', 'Calm'],
  },
];

function LeaderboardRow({ user, rank }) {
  const isMe = user.isMe;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 16px',
      borderRadius: '20px',
      background: isMe ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
      boxShadow: isMe ? 'inset 0 0 0 1px #bae6fd' : 'none',
      marginBottom: '4px',
    }}>
      {/* Rank */}
      <div className={`rank-num rank-${rank <= 3 ? rank : 'other'}`}>
        {rank === 1 ? <Crown size={14} color="#fff" /> : rank}
      </div>

      {/* Avatar */}
      <div style={{
        width: 44, height: 44,
        borderRadius: '50%',
        background: isMe ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', flexShrink: 0,
        border: '2px solid var(--bg-card)',
        boxShadow: isMe ? '0 0 0 2px #0ea5e9' : '0 2px 6px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        <RenderAvatar avatar={user.avatar} name={user.name} size={44} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontWeight: 700,
            fontSize: '15px',
            color: isMe ? '#0284c7' : 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user.name}
          </span>
          {isMe && (
            <span style={{
              fontSize: '9px', fontWeight: 700,
              background: '#0ea5e9', color: '#fff',
              padding: '2px 7px', borderRadius: '99px',
              letterSpacing: '0.5px',
            }}>
              YOU
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
          ⭐ Level {user.level || 1} • {user.points || 0} XP
        </div>
      </div>

      {/* Streak badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        background: 'var(--bg-card)', padding: '6px 12px',
        borderRadius: '12px', border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-card)',
        flexShrink: 0,
      }}>
        <Flame size={16} color="#f97316" fill="#f97316" />
        <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{user.streak}d</span>
      </div>
    </div>
  );
}

export default function Tribe() {
  const activeChallenges = useStore((s) => s.activeChallenges);
  const selectedChallengeId = useStore((s) => s.selectedChallengeId);
  const selectChallenge = useStore((s) => s.selectChallenge);
  const addChallenge = useStore((s) => s.addChallenge);
  const deleteChallenge = useStore((s) => s.deleteChallenge);
  const leaderboard = useStore((s) => s.leaderboard);

  // Realtime User State for Leaderboard
  const userName = useStore((s) => s.userName);
  const userAvatar = useStore((s) => s.userAvatar);
  const streak = useStore((s) => s.streak);
  const points = useStore((s) => s.points);
  const getLevel = useStore((s) => s.getLevel);

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'explore' | 'leaderboard'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [emoji, setEmoji] = useState('🔥');

  // Dynamically inject current user into real-time leaderboard & sort by XP points & streak
  const currentUserEntry = {
    id: 'me',
    name: userName || 'Scholar (You)',
    streak: streak || 0,
    points: points || 0,
    level: getLevel ? getLevel() : 1,
    avatar: userAvatar || '⚡',
    isMe: true,
  };

  const communityLeaderboard = [
    { id: 'u1', name: 'ZenMaster_K',    streak: 84, points: 28400, level: 9, avatar: '🧘' },
    { id: 'u2', name: 'FlowState_Dev',   streak: 61, points: 19500, level: 8, avatar: '💻' },
    { id: 'u3', name: 'IronMind_J',      streak: 55, points: 16200, level: 7, avatar: '🔥' },
    { id: 'u4', name: 'DeepWork_Pro',    streak: 48, points: 12800, level: 7, avatar: '⚡' },
    { id: 'u5', name: 'FocusFuture',     streak: 42, points: 9400,  level: 6, avatar: '🚀' },
  ];

  const fullLeaderboard = [currentUserEntry, ...communityLeaderboard];
  const sortedLeaderboard = fullLeaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.streak - a.streak;
  });

  // Copy Community Goal to user's active goals
  const handleCopyGoal = (item) => {
    const templateTasks = getRoadmapTemplate(item.presetId || 'gate');
    addChallenge({
      title: `${item.emoji} ${item.title}`,
      emoji: item.emoji,
      description: item.description,
    }, templateTasks);

    showToast(`Copied "${item.title}" into your active goals! 🚀`, '📋');
    setActiveTab('active');
  };

  const handleCreateCustomGoal = () => {
    if (!title.trim()) return;
    addChallenge({
      title: title.trim(),
      emoji: emoji || '🎯',
      description: subtitle.trim() || 'Custom goal',
    }, [
      { id: `t_${Date.now()}_1`, title: 'Morning Focus Task', time: '8:00 AM', duration: '45 min', completed: false, points: 30 },
      { id: `t_${Date.now()}_2`, title: 'Evening Practice Session', time: '6:00 PM', duration: '45 min', completed: false, points: 40 }
    ]);

    setTitle('');
    setSubtitle('');
    setShowCreateModal(false);
    showToast('New Custom Goal Created & Activated! 🚀', '✨');
  };

  return (
    <div className="tab-page">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">The Tribe & Goals</h1>
          <p className="page-subtitle">Manage, explore and copy community goal roadmaps</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 16px',
            background: 'var(--accent-sky)',
            color: '#fff',
            border: 'none',
            borderRadius: '16px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: 'var(--shadow-button-sky)',
          }}
        >
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Tribe Section Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'active', label: `🎯 My Goals (${activeChallenges.length})` },
          { id: 'explore', label: '🌍 Explore Community Goals' },
          { id: 'leaderboard', label: '🏆 Leaderboard' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '10px 8px', fontSize: '12px', fontWeight: 700,
              background: activeTab === t.id ? 'var(--accent-sky)' : 'var(--bg-card)',
              border: `1.5px solid ${activeTab === t.id ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
              borderRadius: '16px',
              color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              boxShadow: activeTab === t.id ? 'var(--shadow-button-sky)' : 'var(--shadow-card)',
              transition: 'all 0.2s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '28px', padding: '28px',
            width: '100%', maxWidth: '380px', boxShadow: 'var(--shadow-card-md)',
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Create New Goal
            </h3>

            <div className="section-label">Goal Emoji & Title</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                className="flux-input"
                style={{ width: '60px', textAlign: 'center', fontSize: '20px' }}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
              />
              <input
                className="flux-input"
                style={{ flex: 1 }}
                placeholder="e.g. 30 Days 5AM Study"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="section-label">Description / Subtitle</div>
            <input
              className="flux-input mb-24"
              placeholder="e.g. Wake up early & complete 1 hour study"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-ghost flex-1"
                style={{ borderRadius: '16px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomGoal}
                className="btn btn-primary flex-1"
                style={{ borderRadius: '16px' }}
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: My Active Goals (Dynamic & Deletable) */}
      {activeTab === 'active' && (
        <div>
          {activeChallenges.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <div className="empty-title">No Active Goals</div>
              <div className="empty-desc">Explore community goals or create your own custom goal.</div>
            </div>
          ) : (
            activeChallenges.map((ch) => {
              const isSelected = ch.id === selectedChallengeId;
              return (
                <div
                  key={ch.id}
                  className="card mb-12"
                  style={{
                    padding: '20px 22px',
                    border: `1.5px solid ${isSelected ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
                    background: isSelected ? 'rgba(14, 165, 233, 0.05)' : 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '16px',
                      background: isSelected ? 'var(--accent-sky)' : 'var(--bg-secondary)',
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px', flexShrink: 0,
                    }}>
                      {ch.emoji || '🎯'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>
                        {ch.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
                        {ch.description || 'Active roadmap goal'} • {ch.milestones ? ch.milestones.length : 0} Milestones
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => selectChallenge(ch.id)}
                      style={{
                        padding: '8px 14px', borderRadius: '12px',
                        background: isSelected ? 'var(--accent-sky)' : 'var(--bg-secondary)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                      }}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>

                    {activeChallenges.length > 1 && (
                      <button
                        onClick={() => {
                          deleteChallenge(ch.id);
                          showToast(`Removed goal "${ch.title}"`, '🗑️');
                        }}
                        style={{
                          padding: '8px', borderRadius: '12px',
                          background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        }}
                        title="Remove Goal"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Explore Community Goals to Copy */}
      {activeTab === 'explore' && (
        <div>
          <div className="card card-violet mb-16" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#fde68a" />
              <div>
                <h4 style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>Top Performing Community Roadmaps</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '2px' }}>
                  Tap "Copy Goal" to instantly adopt proven routines into your active goals.
                </p>
              </div>
            </div>
          </div>

          {EXPLORE_COMMUNITY_GOALS.map((item) => (
            <div key={item.id} className="card mb-12" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '30px' }}>{item.emoji}</span>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>{item.title}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                      By {item.author} • 🔥 {item.streak} day streak
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyGoal(item)}
                  style={{
                    padding: '8px 14px', borderRadius: '14px',
                    background: 'var(--accent-sky)', color: '#fff', border: 'none',
                    fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    boxShadow: 'var(--shadow-button-sky)', flexShrink: 0,
                  }}
                >
                  <Copy size={14} /> Copy Goal
                </button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 500, lineHeight: 1.5 }}>
                {item.description}
              </p>

              <div style={{ display: 'flex', gap: '6px' }}>
                {item.tags.map((t, idx) => (
                  <span key={idx} className="badge badge-sky" style={{ fontSize: '10px' }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Tribe Leadership Board */}
      {activeTab === 'leaderboard' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--glass-border)',
            background: 'var(--bg-card)',
          }}>
            <span className="section-label" style={{ marginBottom: 0 }}>Rank &amp; User</span>
            <span className="section-label" style={{ marginBottom: 0 }}>Day Streak</span>
          </div>

          <div style={{ padding: '8px 8px' }}>
            {sortedLeaderboard.map((user, index) => (
              <LeaderboardRow key={user.id} user={user} rank={index + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
