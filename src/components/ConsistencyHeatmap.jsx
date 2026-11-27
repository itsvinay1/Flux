import React from 'react';
import { getLocalDateString } from '../utils/dateUtils';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function ConsistencyHeatmap({ focusSessions = [] }) {
  const now = new Date();
  const todayStr = getLocalDateString(now);

  // Map of date -> hours
  const sessionMap = {};
  focusSessions.forEach((s) => {
    sessionMap[s.date] = s.hours;
  });

  // Monday = 0, ..., Sunday = 6
  const currentDayOfWeek = (now.getDay() + 6) % 7;

  // We show 20 weeks (140 days).
  // Align start to Monday 19 weeks ago so row 0 is strictly Monday through row 6 Sunday.
  const numWeeks = 20;
  const days = [];
  const startOffset = (numWeeks - 1) * 7 + currentDayOfWeek;

  for (let i = startOffset; i >= (currentDayOfWeek - 6); i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const isFuture = dateStr > todayStr;
    const hrs = sessionMap[dateStr] || 0;
    days.push({ date: dateStr, hours: hrs, isFuture });
  }

  const getColor = (hrs, isFuture) => {
    if (isFuture) return 'rgba(255, 255, 255, 0.03)';
    if (hrs === 0) return 'var(--glass-border)';
    if (hrs < 1.5) return '#7dd3fc';
    if (hrs < 3.5) return '#0ea5e9';
    return '#0284c7';
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            Consistency Heatmap
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
            Last 20 Weeks Activity
          </p>
        </div>

        {/* 4-Level Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>Less</span>
          <div title="0 hrs" style={{ width: 11, height: 11, borderRadius: 3, background: 'var(--glass-border)' }} />
          <div title="< 1.5 hrs" style={{ width: 11, height: 11, borderRadius: 3, background: '#7dd3fc' }} />
          <div title="1.5 - 3.5 hrs" style={{ width: 11, height: 11, borderRadius: 3, background: '#0ea5e9' }} />
          <div title="> 3.5 hrs" style={{ width: 11, height: 11, borderRadius: 3, background: '#0284c7' }} />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap with Weekday initials on left */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
        {/* Weekday Initials Column */}
        <div style={{
          display: 'grid',
          gridTemplateRows: 'repeat(7, 12px)',
          gap: '4px',
          paddingRight: '2px',
          userSelect: 'none',
        }}>
          {WEEKDAYS.map((initial, idx) => (
            <div
              key={idx}
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                lineHeight: '12px',
                textAlign: 'center',
                width: '10px',
              }}
            >
              {initial}
            </div>
          ))}
        </div>

        {/* Grid of Weeks (7 rows: Monday to Sunday) */}
        <div style={{
          display: 'grid',
          gridTemplateRows: 'repeat(7, 12px)',
          gridAutoFlow: 'column',
          gap: '4px',
        }}>
          {days.map((day) => (
            <div
              key={day.date}
              title={day.isFuture ? `${day.date} (Upcoming)` : `${day.date}: ${day.hours} hrs focus`}
              style={{
                width: '12px', height: '12px',
                borderRadius: '3px',
                background: getColor(day.hours, day.isFuture),
                border: day.isFuture ? '1px dashed rgba(255,255,255,0.08)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
