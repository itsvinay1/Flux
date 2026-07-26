import React from 'react';
import { Home, Map, Timer, BookOpen, Users, User, Bot } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Home',    Icon: Home },
  { id: 'roadmap',   label: 'Journey', Icon: Map },
  { id: 'focus',     label: 'Focus',   Icon: Timer },
  { id: 'coach',     label: 'Coach',   Icon: Bot },
  { id: 'journal',   label: 'Journal', Icon: BookOpen },
  { id: 'tribe',     label: 'Tribe',   Icon: Users },
  { id: 'profile',   label: 'Profile', Icon: User },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ id, label, Icon }) => {
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
              <Icon
                className="nav-icon"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </div>
            <span className="nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
