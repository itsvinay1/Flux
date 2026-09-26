import React, { useState } from 'react';
import {
  LayoutDashboard, Route, Timer, BrainCircuit, MoreHorizontal,
  NotebookPen, GraduationCap, UsersRound, CircleUser, X
} from 'lucide-react';

// Primary tabs always shown in bottom bar
const PRIMARY_TABS = [
  { id: 'dashboard', label: 'Home',    Icon: LayoutDashboard },
  { id: 'roadmap',   label: 'Journey', Icon: Route },
  { id: 'focus',     label: 'Focus',   Icon: Timer },
  { id: 'coach',     label: 'Coach',   Icon: BrainCircuit },
];

// Tabs in the "More" bottom sheet
const MORE_TABS = [
  { id: 'journal',  label: 'Journal',  Icon: NotebookPen,   desc: 'Reflect on your day' },
  { id: 'syllabus', label: 'Study',    Icon: GraduationCap, desc: 'Syllabus & course tracker' },
  { id: 'tribe',    label: 'Tribe',    Icon: UsersRound,    desc: 'Leaderboard & community goals' },
  { id: 'profile',  label: 'Profile',  Icon: CircleUser,    desc: 'Stats, settings & account' },
];

const MORE_IDS = MORE_TABS.map((t) => t.id);

export default function BottomNav({ activeTab, onTabChange }) {
  const [showMore, setShowMore] = useState(false);
  const moreIsActive = MORE_IDS.includes(activeTab);

  const handleTabChange = (id) => {
    onTabChange(id);
    setShowMore(false);
  };

  return (
    <>
      {/* ── More Sheet Overlay ── */}
      {showMore && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(10,16,30,0.55)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setShowMore(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              maxWidth: 480, margin: '0 auto',
              background: 'rgba(22,32,50,0.97)',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '28px 28px 0 0',
              padding: '20px 20px 40px',
              backdropFilter: 'blur(32px)',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
              animation: 'slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, margin: '0 auto 20px' }} />

            {/* Sheet title row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px' }}>More Sections</span>
              <button
                onClick={() => setShowMore(false)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 99, padding: '5px 5px', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid of more tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {MORE_TABS.map(({ id, label, Icon, desc }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleTabChange(id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      gap: 8, padding: '16px', borderRadius: 20,
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(99,102,241,0.2))'
                        : 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${isActive ? 'rgba(14,165,233,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 14,
                      background: isActive ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isActive ? '0 6px 18px rgba(14,165,233,0.4)' : 'none',
                    }}>
                      <Icon size={20} color={isActive ? '#fff' : '#94a3b8'} strokeWidth={isActive ? 2.5 : 1.8} />
                    </div>
                    <div>
                      <div style={{ color: isActive ? '#38bdf8' : '#e2e8f0', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>{label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 500, marginTop: 2, lineHeight: 1.4, fontFamily: 'Outfit, sans-serif' }}>{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Bar ── */}
      <nav className="bottom-nav">
        {PRIMARY_TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`nav-${id}`}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(id)}
              aria-label={label}
            >
              <div className="nav-icon-wrap">
                <Icon className="nav-icon" strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className="nav-label">{label}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          id="nav-more"
          className={`nav-item ${moreIsActive || showMore ? 'active' : ''}`}
          onClick={() => setShowMore((v) => !v)}
          aria-label="More"
        >
          <div className="nav-icon-wrap">
            <MoreHorizontal className="nav-icon" strokeWidth={moreIsActive || showMore ? 2.5 : 1.8} />
          </div>
          <span className="nav-label">{moreIsActive ? MORE_TABS.find(t => t.id === activeTab)?.label ?? 'More' : 'More'}</span>
        </button>
      </nav>
    </>
  );
}
