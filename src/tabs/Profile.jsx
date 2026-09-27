import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Edit3, Save, Trophy, Flame, Clock, Target,
  CheckCircle, Wifi, WifiOff, Trash2, AlertTriangle,
  ChevronRight, Shield, FileText, Database, Zap,
  LogOut, RefreshCw, Star, Lock, Snowflake, BookOpen
} from 'lucide-react';
import useStore, { ACHIEVEMENTS, getLevelName } from '../store/useStore';
import { useNetworkStore, useSyncQueue } from '../sync/syncManager';
import { getAICacheStats, clearAICache, getRemainingCalls } from '../ai/aiCache';
import { showToast } from '../components/Toast';
import RenderAvatar from '../components/Avatar';
import PrivacyPolicyModal from '../components/PrivacyPolicy';
import TermsOfServiceModal from '../components/TermsOfService';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

const AVATAR_OPTIONS = ['⚡', '🚀', '🔥', '🧠', '💎', '🦁', '🌊', '⭐', '🎯', '💪', '🦅', '🌿'];

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ onClose }) {
  const userName = useStore((s) => s.userName);
  const userAvatar = useStore((s) => s.userAvatar);
  const userBio = useStore((s) => s.userBio);
  const updateProfile = useStore((s) => s.updateProfile);

  const [name, setName] = useState(userName);
  const [avatar, setAvatar] = useState(userAvatar);
  const [bio, setBio] = useState(userBio);

  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    updateProfile({ userName: name.trim(), userAvatar: avatar, userBio: bio.trim() });
    showToast('Profile updated', 'check');
    onClose();
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        background: 'rgba(15,23,42,0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overscrollBehavior: 'none',
        touchAction: 'none',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px calc(36px + env(safe-area-inset-bottom, 16px))',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 -20px 60px rgba(0,0,0,0.25)',
          animation: 'slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          touchAction: 'pan-y',
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        <div style={{ width: 36, height: 4, background: 'var(--glass-border)', borderRadius: 4, margin: '0 auto 20px' }} />

        <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '18px', color: 'var(--text-primary)' }}>Edit Profile</h3>

        {/* Avatar picker */}
        <div className="section-label">Choose Avatar</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
          {AVATAR_OPTIONS.map((em) => (
            <button key={em} onClick={() => setAvatar(em)} style={{
              width: 44, height: 44, borderRadius: '12px', fontSize: '20px',
              border: `2px solid ${avatar === em ? '#0ea5e9' : 'var(--glass-border)'}`,
              background: avatar === em ? 'rgba(14,165,233,0.15)' : 'var(--bg-secondary)',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}>
              {em}
            </button>
          ))}
        </div>

        {/* Name */}
        <div className="section-label">Display Name</div>
        <input
          className="flux-input mb-16"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={24}
        />

        {/* Bio */}
        <div className="section-label">Bio (optional)</div>
        <input
          className="flux-input mb-24"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="e.g. Building daily focus habits"
          maxLength={60}
        />

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '14px',
            background: 'var(--accent-sky)', color: '#fff',
            border: 'none', borderRadius: '14px',
            fontWeight: 700, fontSize: '15px',
            cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            boxShadow: 'var(--shadow-button-sky)',
          }}
        >
          Save Changes
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ onClose, onConfirm }) {
  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        background: 'rgba(15,23,42,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overscrollBehavior: 'none',
        touchAction: 'none',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '28px 24px',
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.25s ease',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div style={{
          width: 56, height: 56, background: '#fef2f2', borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <AlertTriangle size={28} color="#ef4444" />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Delete Everything?
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500, marginBottom: '22px' }}>
          This will permanently erase all streaks, focus sessions, journal entries, and progress from this device.
        </p>
        <button onClick={onConfirm} style={{
          width: '100%', padding: '13px', marginBottom: '10px',
          background: '#ef4444', color: '#fff', border: 'none',
          borderRadius: '14px', fontWeight: 700, fontSize: '14px',
          cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
          boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
        }}>
          Yes, Delete My Data
        </button>
        <button onClick={onClose} style={{
          width: '100%', padding: '13px',
          background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none',
          borderRadius: '14px', fontWeight: 700, fontSize: '14px',
          cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
        }}>
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Sync Status Bar ──────────────────────────────────────────────────────────
function SyncStatusBar() {
  const isOnline = useNetworkStore((s) => s.isOnline);
  const syncStatus = useNetworkStore((s) => s.syncStatus);
  const pendingChanges = useNetworkStore((s) => s.pendingChanges);
  const lastSyncedAt = useNetworkStore((s) => s.lastSyncedAt);

  const statusConfig = {
    synced:  { color: '#10b981', bg: '#ecfdf5', icon: <Wifi size={14} />,       label: 'All data backed up' },
    syncing: { color: '#0ea5e9', bg: '#e0f2fe', icon: <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />, label: 'Syncing...' },
    pending: { color: '#f59e0b', bg: '#fffbeb', icon: <WifiOff size={14} />,     label: `${pendingChanges} changes pending` },
    error:   { color: '#ef4444', bg: '#fef2f2', icon: <WifiOff size={14} />,     label: 'Sync error - will retry' },
  };

  const cfg = statusConfig[syncStatus] || statusConfig.synced;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      background: cfg.bg,
      borderRadius: '16px',
      border: `1px solid ${cfg.color}30`,
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: cfg.color, fontWeight: 600, fontSize: '13px' }}>
        {cfg.icon}
        {cfg.label}
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
        {isOnline ? '🟢 Online' : '🔴 Offline'}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function MiniStat({ Icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
      borderRadius: '20px', padding: '16px 10px', textAlign: 'center',
      boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '12px',
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '8px',
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '3px' }}>{label}</div>
    </div>
  );
}

// ─── Achievement Grid ─────────────────────────────────────────────────────────
function AchievementGrid() {
  const unlocked = useStore((s) => s.unlockedAchievements);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div className="section-label" style={{ marginBottom: 0 }}>Achievements</div>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
          {unlocked.length}/{ACHIEVEMENTS.length} unlocked
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlocked.includes(ach.id);
          return (
            <div
              key={ach.id}
              title={`${ach.title}: ${ach.desc}`}
              style={{
                aspectRatio: '1',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
                background: isUnlocked ? '#fff' : '#f8fafc',
                border: `1.5px solid ${isUnlocked ? '#e2e8f0' : '#f1f5f9'}`,
                boxShadow: isUnlocked ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                opacity: isUnlocked ? 1 : 0.3,
                filter: isUnlocked ? 'none' : 'grayscale(100%)',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {isUnlocked ? ach.emoji : <Lock size={14} color="#cbd5e1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Streak Freeze Card ───────────────────────────────────────────────────────
function StreakFreezeCard() {
  const streakFreezeTokens = useStore((s) => s.streakFreezeTokens);
  const isRestMode = useStore((s) => s.isRestMode);
  const activateStreakFreeze = useStore((s) => s.activateStreakFreeze);

  return (
    <div className="card mb-20" style={{ padding: '20px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1.5px solid #bae6fd' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Snowflake size={18} color="#0284c7" /> Streak Freeze & Vacation Mode
          </div>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 500, marginTop: '4px' }}>
            {isRestMode ? '❄️ Vacation Mode Active! Your streak is protected.' : `${streakFreezeTokens} Freeze Tokens available to protect streak on sick/rest days.`}
          </div>
        </div>
        {!isRestMode && (
          <button
            onClick={() => {
              const success = activateStreakFreeze();
              if (success) {
                showToast('Streak Freeze activated', 'info');
              } else {
                showToast('No freeze tokens left', 'info');
              }
            }}
            disabled={streakFreezeTokens <= 0}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '12px',
              cursor: streakFreezeTokens > 0 ? 'pointer' : 'default',
              opacity: streakFreezeTokens > 0 ? 1 : 0.5,
              flexShrink: 0,
            }}
          >
            Activate
          </button>
        )}
      </div>
    </div>
  );
}

// ─── AI Usage Panel ───────────────────────────────────────────────────────────
function AIUsagePanel() {
  const stats = getAICacheStats();
  const [cleared, setCleared] = useState(false);

  const handleClearCache = () => {
    clearAICache();
    setCleared(true);
    showToast('AI cache cleared', 'info');
  };

  const items = [
    { label: 'Coach Motivation', type: 'hype' },
    { label: 'Roadmap Generator', type: 'roadmap' },
    { label: 'Journal Analysis', type: 'journal' },
  ];

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div className="flex items-center justify-between mb-16">
        <div style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="var(--accent-sky)" /> AI Usage Today
        </div>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
          {stats.totalCached} cached responses
        </span>
      </div>

      {items.map((item) => {
        const remaining = stats.remainingCalls[item.type] ?? 0;
        const limit = stats.dailyLimits[item.type];
        const used = limit - remaining;
        const pct = (used / limit) * 100;
        return (
          <div key={item.type} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ color: 'var(--text-muted)' }}>{used}/{limit} calls</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981',
                borderRadius: 4, transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        );
      })}

      <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
        <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '12px' }}>
          Responses are cached for up to 24h - same context = no API call needed.
        </p>
        <button
          onClick={handleClearCache}
          style={{
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '8px 14px',
            fontSize: '12px', fontWeight: 700, color: '#64748b',
            cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
          }}
        >
          {cleared ? 'Cleared' : 'Clear AI Cache'}
        </button>
      </div>
    </div>
  );
}

// ─── Settings Rows ────────────────────────────────────────────────────────────
function SettingsGroup({ title, items }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div className="section-label">{title}</div>
      <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.onClick}
            style={{
              width: '100%', padding: '16px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none',
              borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: item.danger ? '#ef4444' : '#64748b' }}>{item.icon}</div>
              <span style={{ fontWeight: 600, fontSize: '14px', color: item.danger ? '#ef4444' : '#0f172a' }}>
                {item.label}
              </span>
            </div>
            {item.right || <ChevronRight size={16} color="#cbd5e1" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function Profile() {
  const userName = useStore((s) => s.userName);
  const userAvatar = useStore((s) => s.userAvatar);
  const userBio = useStore((s) => s.userBio);
  const joinedDate = useStore((s) => s.joinedDate);
  const streak = useStore((s) => s.streak);
  const points = useStore((s) => s.points);
  const totalFocusMinutes = useStore((s) => s.totalFocusMinutes);
  const totalTasksCompleted = useStore((s) => s.totalTasksCompleted);
  const perfectFocusSessions = useStore((s) => s.perfectFocusSessions);
  const journalEntries = useStore((s) => s.journalEntries);
  const getLevel = useStore((s) => s.getLevel);
  const getLevelName = useStore((s) => s.getLevelName);
  const getLevelProgress = useStore((s) => s.getLevelProgress);
  const clearAllData = useStore((s) => s.clearAllData);
  const pendingChanges = useNetworkStore((s) => s.pendingChanges);

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTos, setShowTos] = useState(false);

  const level = getLevel();
  const levelName = getLevelName();
  const levelProgress = getLevelProgress();

  const memberSince = new Date(joinedDate).toLocaleDateString('en', {
    month: 'long', year: 'numeric',
  });

  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  return (
    <div className="tab-page" style={{ paddingBottom: 100 }}>
      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
      {showDelete && (
        <DeleteModal
          onClose={() => setShowDelete(false)}
          onConfirm={() => { clearAllData(); }}
        />
      )}
      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
      {showTos && <TermsOfServiceModal onClose={() => setShowTos(false)} />}

      {/* ── Header ── */}
      <div style={{ paddingTop: '12px', marginBottom: '24px' }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Your journey, your data, your rules.</p>
      </div>

      {/* ── Sync Status ── */}
      <SyncStatusBar />

      {/* ── Profile Card ── */}
      <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '24px',
            background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', flexShrink: 0,
            border: '3px solid #fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}>
            <RenderAvatar avatar={userAvatar} name={userName} size={72} fontSize="36px" />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: '2px' }}>
              {userName}
            </h2>
            {userBio && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                {userBio}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-sky">{levelName}</span>
              <span className="badge badge-slate">Since {memberSince}</span>
            </div>
          </div>

          {/* Edit button */}
          <button
            id="btn-edit-profile"
            onClick={() => setShowEdit(true)}
            style={{
              padding: '10px', background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)', borderRadius: '14px',
              cursor: 'pointer', color: 'var(--text-secondary)',
              flexShrink: 0,
            }}
          >
            <Edit3 size={18} />
          </button>
        </div>

        {/* Level progress */}
        <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Level {level} - {levelName}</span>
            <span style={{ color: '#0ea5e9' }}>{levelProgress}% to next</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${levelProgress}%`,
              background: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
              borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: '0 0 8px rgba(14,165,233,0.4)',
            }} />
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <MiniStat Icon={Flame} label="Day Streak" value={streak} color="#f97316" />
        <MiniStat Icon={Trophy} label="Points" value={points} color="#f59e0b" />
        <MiniStat Icon={Clock} label="Focus Hrs" value={totalFocusHours} color="#0ea5e9" />
        <MiniStat Icon={CheckCircle} label="Tasks Done" value={totalTasksCompleted} color="#10b981" />
        <MiniStat Icon={Target} label="Perfect Sessions" value={perfectFocusSessions} color="#0ea5e9" />
        <MiniStat Icon={BookOpen} label="Entries" value={journalEntries.length} color="#0ea5e9" />
      </div>

      {/* ── Streak Freeze & Vacation Mode ── */}
      <StreakFreezeCard />


      {/* ── AI Usage ── */}
      <AIUsagePanel />

      {/* ── Data & Storage ── */}
      <div style={{ marginTop: '20px' }}>
        <SettingsGroup
          title="Data & Storage"
          items={[
            {
              icon: <Database size={18} />,
              label: 'Your data stays on this device',
              right: (
                <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                  Private
                </span>
              ),
              onClick: () => showToast('Data is stored privately on your device', 'info'),
            },
            {
              icon: <RefreshCw size={18} />,
              label: pendingChanges > 0 ? `${pendingChanges} changes waiting to sync` : 'All data backed up',
              right: (
                <span style={{ fontSize: '11px', background: pendingChanges > 0 ? '#fffbeb' : '#ecfdf5', color: pendingChanges > 0 ? '#d97706' : '#059669', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                  {pendingChanges > 0 ? 'Pending' : 'Synced'}
                </span>
              ),
              onClick: () => showToast('Sync happens automatically when online', 'info'),
            },
          ]}
        />

        <SettingsGroup
          title="Legal & Privacy"
          items={[
            { icon: <Shield size={18} />,   label: 'Privacy Policy',   onClick: () => setShowPrivacy(true) },
            { icon: <FileText size={18} />, label: 'Terms of Service', onClick: () => setShowTos(true) },
          ]}
        />

        <SettingsGroup
          title="Account Management"
          items={[
            {
              icon: <LogOut size={18} />,
              label: 'Sign Out of Account',
              onClick: () => {
                useStore.getState().updateProfile({ isAuthenticated: false, userName: 'Scholar', userId: '' });
                ['flux-sync-queue', 'flux-ai-cache', 'flux-ai-rates'].forEach((k) => localStorage.removeItem(k));
                showToast('Signed out successfully 👋', '⚡');
              },
              right: <ChevronRight size={16} color="var(--text-secondary)" />,
            },
          ]}
        />

        <SettingsGroup
          title="Danger Zone"
          items={[
            {
              icon: <Trash2 size={18} />,
              label: 'Delete Account & All Data',
              danger: true,
              onClick: () => setShowDelete(true),
              right: <ChevronRight size={16} color="#ef4444" />,
            },
          ]}
        />

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#cbd5e1', fontWeight: 500, paddingBottom: '8px' }}>
          FLUX v1.0.0 · Your data, your device, your rules.
        </p>
      </div>
    </div>
  );
}
