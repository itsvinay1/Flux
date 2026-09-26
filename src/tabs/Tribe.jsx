import React, { useState, useEffect, useRef } from 'react';
import {
  Flame, Crown, Users, Plus, Copy, Sparkles,
  Trophy, RefreshCw, Wifi, WifiOff, ChevronRight
} from 'lucide-react';
import {
  collection, onSnapshot, doc, setDoc, serverTimestamp, query, orderBy, limit
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';
import { getRoadmapTemplate } from '../mockAI';
import RenderAvatar from '../components/Avatar';

// ─── Community Explore Goals ──────────────────────────────────────────────────
const EXPLORE_COMMUNITY_GOALS = [
  {
    id: 'exp_gate_2026', presetId: 'gate', emoji: '🎓',
    title: 'GATE 2026 Ranker Routine',
    author: 'Rahul S. (Rank 14)', streak: 84,
    description: 'Structured 4-step daily schedule for Engineering Maths, PYQs & Error analysis.',
    tags: ['GATE', 'Engineering', 'PYQ'],
  },
  {
    id: 'exp_neet_warriors', presetId: 'neet', emoji: '🩺',
    title: 'NEET 700+ Line-by-Line NCERT',
    author: 'Dr. Ananya P.', streak: 92,
    description: 'NCERT Biology intensive, Physics numerical drills & Chemistry mechanisms.',
    tags: ['NEET', 'Medical', 'NCERT'],
  },
  {
    id: 'exp_jee_air', presetId: 'jee', emoji: '🚀',
    title: 'IIT JEE Top 500 Strategy',
    author: 'Vikas M.', streak: 110,
    description: 'HC Verma Physics, Advanced Calculus & Organic Mechanism drills.',
    tags: ['IIT JEE', 'Maths', 'Physics'],
  },
  {
    id: 'exp_govt_upsc', presetId: 'govt', emoji: '🏛️',
    title: 'Govt Exams & Current Affairs',
    author: 'Priya K.', streak: 65,
    description: 'Quant speed drills, logical puzzles & daily current affairs reading.',
    tags: ['Govt Exams', 'Aptitude'],
  },
  {
    id: 'exp_deep_work', presetId: 'relax', emoji: '🧘',
    title: 'Mindful Stress-Free Flow',
    author: 'Kiran G.', streak: 45,
    description: 'Morning meditation, digital detox walk & evening reflection.',
    tags: ['Meditation', 'Focus', 'Calm'],
  },
];

// ─── Leaderboard Row ──────────────────────────────────────────────────────────
function LeaderboardRow({ user, rank }) {
  const isMe = user.isMe;

  const rankColors = ['#f59e0b', '#94a3b8', '#cd7c32'];
  const rankBgs = [
    'linear-gradient(135deg,#fef9c3,#fde68a)',
    'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
    'linear-gradient(135deg,#fff7ed,#fed7aa)',
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderRadius: 20,
      background: isMe
        ? 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(99,102,241,0.06))'
        : rank <= 3 ? 'rgba(255,255,255,0.02)' : 'transparent',
      boxShadow: isMe ? 'inset 0 0 0 1.5px rgba(14,165,233,0.35)' : 'none',
      marginBottom: 4,
      transition: 'all 0.2s ease',
    }}>
      {/* Rank Badge */}
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: rank <= 3 ? rankBgs[rank - 1] : 'var(--bg-secondary)',
        fontWeight: 800, fontSize: rank <= 3 ? 14 : 13,
        color: rank <= 3 ? rankColors[rank - 1] : 'var(--text-muted)',
        border: rank === 1 ? '1.5px solid #fde68a' : 'none',
      }}>
        {rank === 1 ? <Crown size={15} color="#d97706" fill="#fbbf24" /> : rank}
      </div>

      {/* Avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
        background: isMe ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, overflow: 'hidden',
        border: `2px solid ${isMe ? '#0ea5e9' : 'var(--glass-border)'}`,
        boxShadow: isMe ? '0 0 0 2px rgba(14,165,233,0.25)' : 'none',
      }}>
        <RenderAvatar avatar={user.avatar} name={user.name} size={42} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontWeight: 700, fontSize: 14,
            color: isMe ? '#0ea5e9' : 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user.name}
          </span>
          {isMe && (
            <span style={{
              fontSize: 8, fontWeight: 800,
              background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff',
              padding: '2px 6px', borderRadius: 99, letterSpacing: '0.5px', flexShrink: 0,
            }}>YOU</span>
          )}
          {rank === 1 && !isMe && (
            <span style={{ fontSize: 10 }}>👑</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
          Lv.{user.level || 1} · {(user.points || 0).toLocaleString()} XP
        </div>
      </div>

      {/* Streak */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'var(--bg-secondary)', padding: '5px 10px',
        borderRadius: 10, border: '1px solid var(--glass-border)', flexShrink: 0,
      }}>
        <Flame size={14} color="#f97316" fill="#f97316" />
        <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>{user.streak}d</span>
      </div>
    </div>
  );
}

// ─── Main Tribe Component ─────────────────────────────────────────────────────
export default function Tribe({ onNavigate }) {
  const activeChallenges = useStore((s) => s.activeChallenges);
  const selectedChallengeId = useStore((s) => s.selectedChallengeId);
  const selectChallenge = useStore((s) => s.selectChallenge);
  const addChallenge = useStore((s) => s.addChallenge);
  const deleteChallenge = useStore((s) => s.deleteChallenge);

  const userName = useStore((s) => s.userName);
  const userAvatar = useStore((s) => s.userAvatar);
  const streak = useStore((s) => s.streak);
  const points = useStore((s) => s.points);
  const getLevel = useStore((s) => s.getLevel);
  const userId = useStore((s) => s.userId);

  const [activeSection, setActiveSection] = useState('leaderboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [emoji, setEmoji] = useState('🔥');

  // ── Real-time leaderboard state ──
  const [liveBoard, setLiveBoard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [lbError, setLbError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState(null);
  const unsubRef = useRef(null);

  // Track online/offline
  useEffect(() => {
    const up = () => setIsOnline(true);
    const dn = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, []);

  // Write current user's score to Firestore whenever points/streak changes
  useEffect(() => {
    const uid = auth.currentUser?.uid || userId;
    if (!uid || uid.startsWith('guest_')) return; // guests don't appear on leaderboard

    const level = getLevel ? getLevel() : 1;
    const docRef = doc(db, 'leaderboard', uid);
    setDoc(docRef, {
      name: userName || 'Scholar',
      avatar: userAvatar || '⚡',
      points: points || 0,
      streak: streak || 0,
      level,
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch(() => {});
  }, [points, streak, userName, userAvatar]);

  // Subscribe to real-time leaderboard
  useEffect(() => {
    setLbLoading(true);
    try {
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('points', 'desc'),
        limit(50)
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const uid = auth.currentUser?.uid || userId;
          const docs = snap.docs.map((d) => ({
            id: d.id,
            isMe: d.id === uid,
            ...d.data(),
          }));
          setLiveBoard(docs);
          setLbLoading(false);
          setLbError(false);
          setLastUpdated(new Date());
        },
        (err) => {
          console.warn('[FLUX Leaderboard] Firestore error:', err);
          setLbError(true);
          setLbLoading(false);
        }
      );
      unsubRef.current = unsub;
    } catch (e) {
      setLbError(true);
      setLbLoading(false);
    }

    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [userId]);

  // Build final sorted leaderboard — always include self even if doc not yet indexed
  const currentUserEntry = {
    id: auth.currentUser?.uid || userId || 'me',
    name: userName || 'Scholar (You)',
    streak: streak || 0,
    points: points || 0,
    level: getLevel ? getLevel() : 1,
    avatar: userAvatar || '⚡',
    isMe: true,
  };

  const finalBoard = (() => {
    const uid = auth.currentUser?.uid || userId;
    const hasMe = liveBoard.some((u) => u.id === uid);
    const base = hasMe ? liveBoard : [currentUserEntry, ...liveBoard];
    return [...base].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.streak - a.streak;
    });
  })();

  const myRank = finalBoard.findIndex((u) => u.isMe) + 1;

  const handleCopyGoal = (item) => {
    const tasks = getRoadmapTemplate(item.presetId || 'gate');
    addChallenge({ title: `${item.emoji} ${item.title}`, emoji: item.emoji, description: item.description }, tasks);
    showToast(`Copied "${item.title}" into active goals! 🚀`, '📋');
    setActiveSection('goals');
  };

  const handleCreateCustomGoal = () => {
    if (!title.trim()) return;
    addChallenge(
      { title: title.trim(), emoji: emoji || '🎯', description: subtitle.trim() || 'Custom goal' },
      [
        { id: `t_${Date.now()}_1`, title: 'Morning Focus Task', time: '8:00 AM', duration: '45 min', completed: false, points: 30 },
        { id: `t_${Date.now()}_2`, title: 'Evening Practice Session', time: '6:00 PM', duration: '45 min', completed: false, points: 40 },
      ]
    );
    setTitle(''); setSubtitle(''); setShowCreateModal(false);
    showToast('New Custom Goal Created & Activated! 🚀', '✨');
  };

  const SECTIONS = [
    { id: 'leaderboard', label: '🏆 Rankings' },
    { id: 'goals',       label: '🎯 My Goals' },
    { id: 'explore',     label: '🌍 Explore' },
  ];

  return (
    <div className="tab-page" style={{ paddingBottom: 100 }}>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 28, padding: 28, width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-card-md)', animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>Create New Goal</h3>
            <div className="section-label">Emoji & Title</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="flux-input" style={{ width: 60, textAlign: 'center', fontSize: 20 }} value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} />
              <input className="flux-input" style={{ flex: 1 }} placeholder="e.g. 30 Days 5AM Study" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="section-label">Description</div>
            <input className="flux-input mb-24" placeholder="e.g. Wake up early & complete 1 hour study" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost flex-1" style={{ borderRadius: 16 }}>Cancel</button>
              <button onClick={handleCreateCustomGoal} className="btn btn-primary flex-1" style={{ borderRadius: 16 }}>Create Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 12 }}>
        <div>
          <h1 className="page-title">The Tribe</h1>
          <p className="page-subtitle">Real-time rankings & community goals</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '10px 16px', background: 'var(--accent-sky)', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Outfit, sans-serif', boxShadow: 'var(--shadow-button-sky)' }}
        >
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* ── Section Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              flex: 1, padding: '10px 6px', fontSize: 11, fontWeight: 700,
              background: activeSection === s.id ? 'var(--accent-sky)' : 'var(--bg-card)',
              border: `1.5px solid ${activeSection === s.id ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
              borderRadius: 14, color: activeSection === s.id ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              boxShadow: activeSection === s.id ? 'var(--shadow-button-sky)' : 'var(--shadow-card)',
              transition: 'all 0.2s ease',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ══ LEADERBOARD ══ */}
      {activeSection === 'leaderboard' && (
        <div>
          {/* Status Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isOnline
                ? <Wifi size={14} color="#10b981" />
                : <WifiOff size={14} color="#94a3b8" />}
              <span style={{ fontSize: 11, fontWeight: 700, color: isOnline ? '#10b981' : '#94a3b8' }}>
                {isOnline ? 'Live Leaderboard' : 'Offline — Cached'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {myRank > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-sky)', background: 'rgba(14,165,233,0.1)', padding: '3px 8px', borderRadius: 99 }}>
                  Your Rank: #{myRank}
                </span>
              )}
              {lastUpdated && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {lastUpdated.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          {/* Top 3 Podium */}
          {!lbLoading && finalBoard.length >= 3 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 20, padding: '20px 8px 0' }}>
              {/* 2nd */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-secondary)', overflow: 'hidden', border: '2px solid #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  <RenderAvatar avatar={finalBoard[1]?.avatar} name={finalBoard[1]?.name} size={48} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{finalBoard[1]?.name}</div>
                <div style={{ background: 'linear-gradient(180deg,#94a3b8,#64748b)', width: '100%', height: 48, borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>2</span>
                </div>
              </div>
              {/* 1st */}
              <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 22 }}>👑</span>
                <div style={{ width: 58, height: 58, borderRadius: '50%', overflow: 'hidden', border: '3px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 0 20px rgba(245,158,11,0.4)' }}>
                  <RenderAvatar avatar={finalBoard[0]?.avatar} name={finalBoard[0]?.name} size={58} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{finalBoard[0]?.name}</div>
                <div style={{ background: 'linear-gradient(180deg,#f59e0b,#d97706)', width: '100%', height: 68, borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 22 }}>1</span>
                </div>
              </div>
              {/* 3rd */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', overflow: 'hidden', border: '2px solid #cd7c32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  <RenderAvatar avatar={finalBoard[2]?.avatar} name={finalBoard[2]?.name} size={44} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', maxWidth: 65, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{finalBoard[2]?.name}</div>
                <div style={{ background: 'linear-gradient(180deg,#cd7c32,#92400e)', width: '100%', height: 36, borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>3</span>
                </div>
              </div>
            </div>
          )}

          {/* Full list */}
          <div className="card" style={{ padding: '8px 8px', overflow: 'hidden' }}>
            {lbLoading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--accent-sky)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Loading live rankings…</p>
              </div>
            ) : lbError ? (
              <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                <WifiOff size={28} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Could not load leaderboard</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Check your connection and try again</p>
              </div>
            ) : finalBoard.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                <Trophy size={32} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Be the first on the leaderboard!</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Complete tasks to earn XP</p>
              </div>
            ) : (
              finalBoard.map((user, i) => (
                <LeaderboardRow key={user.id} user={user} rank={i + 1} />
              ))
            )}
          </div>

          {/* Navigate to Focus */}
          <button
            onClick={() => onNavigate && onNavigate('focus')}
            style={{ width: '100%', marginTop: 14, padding: '14px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', border: 'none', borderRadius: 18, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 24px rgba(14,165,233,0.35)' }}
          >
            ⚡ Start Focus Session to Earn XP <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ══ MY GOALS ══ */}
      {activeSection === 'goals' && (
        <div>
          {activeChallenges.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <div className="empty-title">No Active Goals</div>
              <div className="empty-desc">Explore community goals or create your own.</div>
              <button
                onClick={() => setActiveSection('explore')}
                style={{ marginTop: 14, padding: '10px 20px', background: 'var(--accent-sky)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
              >
                Browse Community Goals
              </button>
            </div>
          ) : (
            activeChallenges.map((ch) => {
              const isSelected = ch.id === selectedChallengeId;
              return (
                <div key={ch.id} className="card mb-12" style={{ padding: '18px 20px', border: `1.5px solid ${isSelected ? 'var(--accent-sky)' : 'var(--glass-border)'}`, background: isSelected ? 'rgba(14,165,233,0.04)' : 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: isSelected ? 'var(--accent-sky)' : 'var(--bg-secondary)', color: isSelected ? '#fff' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {ch.emoji || '🎯'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.title}</h3>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>
                      {ch.milestones ? ch.milestones.length : 0} Milestones
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => selectChallenge(ch.id)}
                      style={{ padding: '7px 13px', borderRadius: 11, background: isSelected ? 'var(--accent-sky)' : 'var(--bg-secondary)', color: isSelected ? '#fff' : 'var(--text-secondary)', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                    >
                      {isSelected ? '✓ Active' : 'Select'}
                    </button>
                    {activeChallenges.length > 1 && (
                      <button
                        onClick={() => { deleteChallenge(ch.id); showToast(`Removed "${ch.title}"`, '🗑️'); }}
                        style={{ padding: '7px', borderRadius: 11, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <button
            onClick={() => onNavigate && onNavigate('roadmap')}
            style={{ width: '100%', marginTop: 8, padding: '13px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1.5px solid var(--glass-border)', borderRadius: 16, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Outfit, sans-serif' }}
          >
            <Route size={16} /> View Goal Roadmap <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ══ EXPLORE ══ */}
      {activeSection === 'explore' && (
        <div>
          <div className="card card-violet mb-16" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={18} color="#fde68a" />
              <div>
                <h4 style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>Top Community Roadmaps</h4>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 }}>Copy proven routines directly into your goals</p>
              </div>
            </div>
          </div>

          {EXPLORE_COMMUNITY_GOALS.map((item) => (
            <div key={item.id} className="card mb-12" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{item.emoji}</span>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{item.title}</h3>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>
                      {item.author} · 🔥 {item.streak}d
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyGoal(item)}
                  style={{ padding: '7px 13px', borderRadius: 12, background: 'var(--accent-sky)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, boxShadow: 'var(--shadow-button-sky)', flexShrink: 0 }}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 500, lineHeight: 1.5 }}>{item.description}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {item.tags.map((t, i) => (
                  <span key={i} className="badge badge-sky" style={{ fontSize: 9 }}>#{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
