import React from 'react';

export default function ConsistencyHeatmap({ focusSessions = [] }) {
  // Generate 52 weeks (364 days) matrix
  const days = [];
  const now = new Date();
  
  // Create mapping of date -> hours
  const sessionMap = {};
  focusSessions.forEach((s) => {
    sessionMap[s.date] = s.hours;
  });

  for (let i = 139; i >= 0; i--) { // Last 20 weeks (140 days) for clean mobile fit
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hrs = sessionMap[dateStr] || 0;
    days.push({ date: dateStr, hours: hrs });
  }

  const getColor = (hrs) => {
    if (hrs === 0) return 'var(--glass-border)';
    if (hrs < 1) return '#bae6fd';
    if (hrs < 2.5) return '#38bdf8';
    if (hrs < 4) return '#0ea5e9';
    return '#0284c7';
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div className="flex items-center justify-between mb-16">
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            Consistency Heatmap
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
            Last 20 Weeks Activity
          </p>
        </div>
        <div style={{ display: 'flex', items: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
          <span>Less</span>
          {[0, 0.5, 2, 3.5, 5].map((h, idx) => (
            <div key={idx} style={{ width: 10, height: 10, borderRadius: 3, background: getColor(h) }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid (7 rows for days of week, columns for weeks) */}
      <div style={{
        display: 'grid',
        gridTemplateRows: 'repeat(7, 1fr)',
        gridAutoFlow: 'column',
        gap: '4px',
        overflowX: 'auto',
        paddingBottom: '6px',
      }}>
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.hours} hrs focus`}
            style={{
              width: '12px', height: '12px',
              borderRadius: '3px',
              background: getColor(day.hours),
              transition: 'transform 0.15s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
