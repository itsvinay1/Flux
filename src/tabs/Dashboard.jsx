import React, { useState } from 'react';
import { Flame, Trophy, Zap, Play, BarChart2, Sparkles, Sun, Moon, Map, Share2, Plus, CheckSquare, Square, Trash2, Quote } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import useStore from '../store/useStore';
import { getHypeMessage } from '../mockAI';
import { showToast } from '../components/Toast';
import ConsistencyHeatmap from '../components/ConsistencyHeatmap';
import ShareCardModal from '../components/ShareCardModal';
import CreateChallengeModal from '../components/CreateChallengeModal';
import RenderAvatar from '../components/Avatar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

function UserHeader({ onNavigate, onShare }) {
  const userName = useStore((s) => s.userName);
  const userAvatar = useStore((s) => s.userAvatar);
  const [isDarkMode, setIsDarkMode] = useState(() => document.body.classList.contains('dark-theme'));

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.body.classList.add('dark-theme');
      showToast('Dark Mode Activated 🌙', '✨');
    } else {
      document.body.classList.remove('dark-theme');
      showToast('Light Mode Activated ☀️', '✨');
    }
  };

  return (
    <div className="sticky-screen-header">
      <div 
        className="flex items-center gap-12" 
        onClick={() => onNavigate && onNavigate('profile')} 
        style={{ cursor: 'pointer' }}
      >
        {/* Avatar */}
        <div style={{
          width: 46, height: 46,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '20px',
          boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
          border: '2px solid var(--bg-card)',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          <RenderAvatar avatar={userAvatar} name={userName} size={46} />
        </div>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            {userName}
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
            Daily Focus &amp; Goals
          </p>
        </div>
      </div>

      {/* Header Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          id="btn-share-card"
          onClick={() => onShare && onShare()}
          aria-label="Share Story Card"
          style={{
            padding: '12px',
            background: 'var(--bg-card)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--glass-border)',
            color: 'var(--accent-sky)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <Share2 size={20} />
        </button>

        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            padding: '12px',
            background: 'var(--bg-card)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--glass-border)',
            color: isDarkMode ? '#f59e0b' : '#0ea5e9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
}

function HypeMeCard() {
  const streak = useStore((s) => s.streak);
  const points = useStore((s) => s.points);
  const [message, setMessage] = React.useState(() => getHypeMessage(streak, points));
  const [loading, setLoading] = React.useState(false);

  const handleHype = () => {
    setLoading(true);
    setTimeout(() => {
      setMessage(getHypeMessage(streak, points));
      setLoading(false);
    }, 700);
  };

  return (
    <div
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        borderRadius: '20px',
        padding: '22px 22px 20px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(14,165,233,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
      }}
    >
      {/* Subtle glow blob */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 140, height: 140,
        background: 'rgba(14,165,233,0.12)',
        borderRadius: '50%',
        filter: 'blur(38px)',
        pointerEvents: 'none',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 12,
            background: 'rgba(14,165,233,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(14,165,233,0.3)',
          }}>
            <Quote size={16} color="#38bdf8" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.2px' }}>Hype Me Up</span>
        </div>
        <button
          id="btn-hype-me"
          onClick={handleHype}
          disabled={loading}
          style={{
            background: loading ? 'rgba(14,165,233,0.08)' : 'rgba(14,165,233,0.18)',
            border: '1px solid rgba(14,165,233,0.3)',
            color: '#38bdf8',
            fontSize: 11,
            fontWeight: 800,
            padding: '7px 14px',
            borderRadius: 10,
            cursor: loading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: 'Outfit, sans-serif',
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </span>
          ) : 'New Quote'}
        </button>
      </div>

      {/* Quote body */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          fontSize: 14, lineHeight: 1.65, fontWeight: 500,
          color: 'rgba(226,232,240,0.9)',
          fontFamily: 'Outfit, sans-serif',
          margin: 0,
        }}>
          {message}
        </p>
      </div>

      {/* Streak badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, position: 'relative', zIndex: 1 }}>
        <Flame size={13} color="#fb923c" fill="#fb923c" />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit, sans-serif' }}>
          {streak} day streak
        </span>
      </div>
    </div>
  );
}

function StatsRow() {
  const streak = useStore((s) => s.streak);
  const points = useStore((s) => s.points);
  const getLevel = useStore((s) => s.getLevel);
  const getNextLevelPoints = useStore((s) => s.getNextLevelPoints);
  const getCurrentLevelPoints = useStore((s) => s.getCurrentLevelPoints);

  const level = getLevel();
  const nextLvl = getNextLevelPoints();
  const curLvl = getCurrentLevelPoints();
  const progress = Math.min(100, Math.round(((points - curLvl) / (nextLvl - curLvl)) * 100));

  return (
    <div className="grid-2 mb-16">
      {/* Streak */}
      <div className="card card-orange" style={{ padding: '20px' }}>
        <div className="flex items-center justify-between mb-16">
          <div style={{
            width: 40, height: 40,
            background: '#ffedd5',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={20} color="#ea580c" />
          </div>
          <span className="badge badge-amber">Streak</span>
        </div>
        <div className="stat-big" style={{ color: 'var(--text-primary)' }}>{streak}</div>
        <div className="stat-label">Days on fire 🔥</div>
      </div>

      {/* Points / Level */}
      <div className="card card-sky-tint" style={{ padding: '20px' }}>
        <div className="flex items-center justify-between mb-16">
          <div style={{
            width: 40, height: 40,
            background: '#e0f2fe',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={20} color="#0284c7" />
          </div>
          <span className="badge badge-sky">Level {level}</span>
        </div>
        <div className="stat-big" style={{ color: 'var(--text-primary)' }}>{points}</div>
        <div className="stat-label">Total Points</div>
        <div className="progress-bar-track light mt-8">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({ onNavigate, onCreateGoal }) {
  const activeChallenges = useStore((s) => s.activeChallenges) || [];
  const selectedChallengeId = useStore((s) => s.selectedChallengeId);
  const selectChallenge = useStore((s) => s.selectChallenge);

  const challenge = activeChallenges.find((c) => c.id === selectedChallengeId) || activeChallenges[0] || {
    title: 'Deep Work Mastery',
    emoji: '🧠',
    completedDays: 1,
    totalDays: 60,
  };

  const milestones = challenge.milestones || [];
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const totalMilestones = milestones.length;

  const progress = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : Math.round(((challenge.completedDays || 1) / (challenge.totalDays || 60)) * 100);

  return (
    <div className="card card-dark mb-16" style={{ padding: '28px' }}>
      {/* Decorative blob */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 200, height: 200,
        background: '#4f46e5',
        borderRadius: '50%',
        mixBlendMode: 'screen',
        filter: 'blur(60px)',
        opacity: 0.25,
        transform: 'translate(30%, -30%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Goal Switcher Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {activeChallenges.map((c) => {
              const isSel = c.id === (challenge.id);
              return (
                <button
                  key={c.id}
                  onClick={() => selectChallenge(c.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    background: isSel ? '#fff' : 'rgba(255,255,255,0.15)',
                    color: isSel ? '#0f172a' : '#fff',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {c.emoji} {c.title}
                </button>
              );
            })}
          </div>

          <button
            onClick={onCreateGoal}
            style={{
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 800,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
              flexShrink: 0, marginLeft: '8px',
            }}
          >
            <Plus size={14} /> New Goal
          </button>
        </div>

        <div className="flex items-center justify-between mb-24">
          <div>
            <span className="badge badge-white" style={{ marginBottom: '8px', display: 'inline-flex' }}>
              Active Goal
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.4px' }}>
              {challenge.emoji} {challenge.title}
            </h2>
          </div>
          <div style={{
            width: 52, height: 52,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            marginLeft: '12px',
          }}>
            <Zap size={24} color="#fbbf24" fill="#fbbf24" />
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>
          <span>{totalMilestones > 0 ? `Milestones: ${completedMilestones}/${totalMilestones} Completed` : `Day ${challenge.completedDays || 1} of ${challenge.totalDays || 60}`}</span>
          <span style={{ color: '#fff', fontWeight: 800 }}>{progress}%</span>
        </div>
        <div className="progress-bar-track" style={{ marginBottom: '20px' }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            id="btn-resume-challenge"
            onClick={() => onNavigate('focus')}
            style={{
              flex: 1, padding: '14px',
              background: '#fff', color: '#0f172a',
              border: 'none', borderRadius: '18px',
              fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              gap: '8px', fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 4px 16px rgba(255,255,255,0.1)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Play size={18} fill="currentColor" /> Resume
          </button>
          <button
            onClick={() => onNavigate('roadmap')}
            style={{
              padding: '14px 20px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
              color: '#fff', fontWeight: 700,
              fontSize: '14px', cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}

function FocusGraph() {
  const focusSessions = useStore((s) => s.focusSessions);

  const labels = focusSessions.map((s) => {
    const d = new Date(s.date + 'T12:00:00');
    return d.toLocaleDateString('en', { weekday: 'short' });
  });
  const hours = focusSessions.map((s) => s.hours);

  const data = {
    labels,
    datasets: [
      {
        data: hours,
        fill: true,
        borderColor: '#0ea5e9',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 140);
          gradient.addColorStop(0, 'rgba(14,165,233,0.28)');
          gradient.addColorStop(1, 'rgba(14,165,233,0)');
          return gradient;
        },
        borderWidth: 3.5,
        tension: 0.45,
        pointRadius: 5,
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#fff',
        pointBorderWidth: 2.5,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#94a3b8',
        bodyColor: '#0f172a',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        bodyFont: { weight: 'bold', family: 'Outfit' },
        padding: 12,
        cornerRadius: 16,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        callbacks: { label: (ctx) => ` ${ctx.raw.toFixed(1)} hrs focused` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 12, weight: '600' } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 11 }, callback: (v) => `${v}h` },
        min: 0,
      },
    },
  };

  const totalHours = focusSessions.reduce((a, s) => a + s.hours, 0).toFixed(1);

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="flex items-center justify-between mb-16">
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '17px', color: '#0f172a' }}>Focus Activity</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>This week</p>
        </div>
        <span className="badge badge-slate">
          <BarChart2 size={11} />
          {totalHours}h total
        </span>
      </div>
      <div style={{ height: '160px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

function TodoSection({ onNavigate }) {
  const todos = useStore((s) => s.todos) || [];
  const toggleTodo = useStore((s) => s.toggleTodo);
  const pendingTodos = todos.filter((t) => !t.completed);
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="card mb-16" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={18} color="var(--accent-sky)" />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Today's Tasks
          </h3>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('todo')}
          style={{
            background: 'rgba(14,165,233,0.1)',
            border: 'none',
            color: 'var(--accent-sky)',
            fontSize: '12px',
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontFamily: 'Outfit, sans-serif'
          }}
        >
          View All ({todos.length})
        </button>
      </div>

      {todos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '13px', margin: '0 0 10px 0', fontWeight: 500 }}>No tasks added yet for today.</p>
          <button
            onClick={() => onNavigate && onNavigate('todo')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'var(--accent-sky)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Create First Task
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {todos.slice(0, 3).map((todo) => (
            <div
              key={todo.id}
              onClick={() => toggleTodo(todo.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: todo.completed ? 'rgba(14, 165, 233, 0.05)' : 'var(--bg-secondary)',
                border: `1px solid ${todo.completed ? 'rgba(14, 165, 233, 0.2)' : 'var(--glass-border)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {todo.completed ? (
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <svg width={11} height={11} viewBox="0 0 13 13" fill="none">
                    <path d="M2.5 6.5L5.5 9.5L10.5 4" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : (
                <Square size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              )}
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: todo.completed ? 'line-through' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }}>
                {todo.title}
              </span>
            </div>
          ))}

          {todos.length > 3 && (
            <div
              onClick={() => onNavigate && onNavigate('todo')}
              style={{
                textAlign: 'center',
                padding: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              + {todos.length - 3} more tasks
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const focusSessions = useStore((s) => s.focusSessions);

  return (
    <div className="tab-page">
      {showShareModal && (
        <ShareCardModal onClose={() => setShowShareModal(false)} />
      )}
      {showCreateGoalModal && (
        <CreateChallengeModal onClose={() => setShowCreateGoalModal(false)} />
      )}

      <UserHeader onNavigate={onNavigate} onShare={() => setShowShareModal(true)} />
      <HypeMeCard />
      <StatsRow />
      <ChallengeCard onNavigate={onNavigate} onCreateGoal={() => setShowCreateGoalModal(true)} />
      <TodoSection onNavigate={onNavigate} />
      <FocusGraph />
      <div style={{ marginTop: '16px' }}>
        <ConsistencyHeatmap focusSessions={focusSessions} />
      </div>
    </div>
  );
}
