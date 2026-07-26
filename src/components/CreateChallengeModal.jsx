import React, { useState } from 'react';
import { Plus, Trash2, Layers } from 'lucide-react';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';

export default function CreateChallengeModal({ onClose }) {
  const addChallenge = useStore((s) => s.addChallenge);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🔥');
  const [totalDays, setTotalDays] = useState(60);

  // Custom Milestones Creation State
  const [milestonesCount, setMilestonesCount] = useState(3);
  const [milestoneHeadings, setMilestoneHeadings] = useState([
    'Morning Concept Reading',
    'Afternoon Practice & Problem Solving',
    'Evening Review & Test Analysis',
  ]);

  const handleCountChange = (count) => {
    const num = Math.min(10, Math.max(1, Number(count) || 1));
    setMilestonesCount(num);
    
    // Adjust headings array size while keeping existing text
    const updated = [...milestoneHeadings];
    if (num > updated.length) {
      for (let i = updated.length; i < num; i++) {
        updated.push(`Milestone ${i + 1}`);
      }
    } else {
      updated.length = num;
    }
    setMilestoneHeadings(updated);
  };

  const handleHeadingChange = (index, value) => {
    const updated = [...milestoneHeadings];
    updated[index] = value;
    setMilestoneHeadings(updated);
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    // Create custom sequence tasks offline based on user input
    const initialTasks = milestoneHeadings.map((heading, i) => ({
      id: `m_custom_${Date.now()}_${i}`,
      title: heading.trim() || `Milestone ${i + 1}`,
      time: `${8 + i * 3}:00 AM`,
      duration: '45 min',
      completed: false,
      points: 40,
    }));

    addChallenge({
      title: title.trim(),
      emoji: emoji || '🎯',
      description: description.trim() || 'Personal custom goal roadmap',
      totalDays: Number(totalDays) || 60,
      completedDays: 1,
    }, initialTasks);

    showToast(`New Goal "${title.trim()}" with ${milestoneHeadings.length} milestones created! 🚀`, '✨');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }} onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          background: 'var(--bg-card)', borderRadius: '28px', padding: '28px',
          width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: 'var(--shadow-card-md)',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '12px',
            background: 'var(--accent-sky)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plus size={20} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Create Custom Goal Roadmap
          </h3>
        </div>

        {/* Goal Emoji & Title */}
        <div className="section-label">Goal Emoji & Title</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <input
            className="flux-input"
            style={{ width: '60px', textAlign: 'center', fontSize: '20px' }}
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={2}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <input
            className="flux-input"
            style={{ flex: 1 }}
            placeholder="e.g. GATE 2026, Learn React"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={50}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {/* Duration */}
        <div className="section-label">Target Duration (Days)</div>
        <input
          className="flux-input mb-16"
          type="number"
          value={totalDays}
          onChange={(e) => setTotalDays(e.target.value)}
          placeholder="60"
        />

        {/* Milestones Setup Offline */}
        <div className="section-label">Number of Milestones Needed</div>
        <input
          className="flux-input mb-16"
          type="number"
          min="1" max="10"
          value={milestonesCount}
          onChange={(e) => handleCountChange(e.target.value)}
        />

        {/* Milestone Headings List */}
        <div className="section-label">Milestone Headings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {milestoneHeadings.map((heading, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>
                #{i + 1}
              </span>
              <input
                className="flux-input"
                style={{ fontSize: '14px' }}
                placeholder={`Heading for Milestone ${i + 1}`}
                value={heading}
                onChange={(e) => handleHeadingChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            className="btn btn-ghost flex-1"
            style={{ borderRadius: '16px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="btn btn-primary flex-1"
            style={{ borderRadius: '16px' }}
          >
            Activate Goal
          </button>
        </div>
      </div>
    </div>
  );
}
