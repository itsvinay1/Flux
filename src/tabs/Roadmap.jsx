import React, { useState } from 'react';
import { Sparkles, CheckCircle, Wand2, Plus, Flag, Target, Layers, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import { generateRoadmap, getRoadmapTemplate } from '../mockAI';
import { showToast } from '../components/Toast';
import CreateChallengeModal from '../components/CreateChallengeModal';

const PRESET_GOALS = [
  { id: 'gate', label: 'GATE 2026', emoji: '🎓', color: '#7c3aed' },
  { id: 'neet', label: 'NEET Prep', emoji: '🩺', color: '#0ea5e9' },
  { id: 'jee', label: 'IIT JEE', emoji: '🚀', color: '#f59e0b' },
  { id: 'govt', label: 'Govt Exams', emoji: '🏛️', color: '#10b981' },
  { id: 'boards', label: 'Board Exams', emoji: '📚', color: '#6366f1' },
  { id: 'relax', label: 'Relax & Calm', emoji: '🧘', color: '#ec4899' },
];

function TimelineTask({ task, index, onComplete, onDelete, totalCompleted }) {
  const isNext = !task.completed && (index === 0 || totalCompleted === index);
  const isLocked = !task.completed && !isNext;

  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      position: 'relative',
      paddingBottom: '16px',
      opacity: isLocked ? 0.6 : 1,
      transition: 'opacity 0.3s ease',
    }}>
      {/* Vertical connector line */}
      {index < 10 && (
        <div style={{
          position: 'absolute',
          left: '19px', top: '40px', bottom: 0,
          width: '2px',
          background: task.completed ? '#10b981' : 'var(--glass-border)',
          borderRadius: '99px',
          transition: 'background 0.5s ease',
        }} />
      )}

      {/* Circle dot */}
      <button
        id={`task-circle-${task.id}`}
        onClick={() => !isLocked && !task.completed && onComplete(task.id)}
        disabled={task.completed || isLocked}
        style={{
          flexShrink: 0,
          width: 40, height: 40,
          borderRadius: '50%',
          border: 'none',
          cursor: task.completed || isLocked ? 'default' : 'pointer',
          background: task.completed
            ? '#10b981'
            : isNext
              ? '#0ea5e9'
              : 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: task.completed
            ? '0 0 0 5px #d1fae5'
            : isNext
              ? '0 0 0 5px #e0f2fe'
              : 'none',
          zIndex: 2,
        }}
      >
        {task.completed ? (
          <CheckCircle size={22} color="#fff" />
        ) : isNext ? (
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff' }} />
        ) : (
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#94a3b8' }} />
        )}
      </button>

      {/* Task card */}
      <div
        className="card"
        style={{
          flex: 1,
          padding: '16px 18px',
          border: isNext ? '2px solid #38bdf8' : '1px solid var(--glass-border)',
          background: isNext ? 'rgba(14, 165, 233, 0.06)' : 'var(--bg-card)',
          transform: isNext ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isNext
            ? '0 8px 24px rgba(14,165,233,0.15)'
            : 'var(--shadow-card)',
          transition: 'all 0.35s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {task.time}
              </span>
              {isNext && (
                <span className="badge badge-sky">Up Next</span>
              )}
            </div>
            <h4 style={{
              fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)',
              textDecoration: task.completed ? 'line-through' : 'none',
              opacity: task.completed ? 0.5 : 1,
            }}>
              {task.title}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', fontWeight: 500 }}>
              ⏱ {task.duration}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span className="badge badge-violet">
              +{task.points || 30}pts
            </span>
            <button
              onClick={() => onDelete(task.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#ef4444', padding: '4px', opacity: 0.7,
                transition: 'opacity 0.2s ease',
              }}
              title="Delete Milestone"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Roadmap() {
  const activeChallenges = useStore((s) => s.activeChallenges);
  const selectedChallengeId = useStore((s) => s.selectedChallengeId);
  const selectChallenge = useStore((s) => s.selectChallenge);
  const addChallenge = useStore((s) => s.addChallenge);
  const addMilestone = useStore((s) => s.addMilestone);
  const deleteChallenge = useStore((s) => s.deleteChallenge);
  const deleteMilestone = useStore((s) => s.deleteMilestone);
  const completeTask = useStore((s) => s.completeRoadmapTask);

  // Pull milestones exclusively for the currently active selected goal
  const currentGoal = activeChallenges.find((c) => c.id === selectedChallengeId) || activeChallenges[0];
  const tasks = currentGoal ? (currentGoal.milestones || []) : [];

  const [goalInput, setGoalInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);

  // New Milestone Form State
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneTime, setMilestoneTime] = useState('12:00 PM');
  const [milestoneDuration, setMilestoneDuration] = useState('30 min');
  const [stackedAfter, setStackedAfter] = useState('');

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleComplete = (taskId) => {
    completeTask(taskId);
    showToast('Milestone complete! Points earned 🎯', '✅');
  };

  const handlePresetSelect = (presetId) => {
    setActivePreset(presetId);
    const newTasks = getRoadmapTemplate(presetId);
    const presetObj = PRESET_GOALS.find(p => p.id === presetId);
    
    // Add as new Goal / Challenge
    addChallenge({
      title: `${presetObj.emoji} ${presetObj.label}`,
      emoji: presetObj.emoji,
      description: `Targeting ${presetObj.label} excellence daily.`,
    }, newTasks);

    showToast(`${presetObj.label} roadmap active! 🎓`, '🚀');
  };

  const handleGenerateAI = () => {
    if (!goalInput.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      const generated = generateRoadmap(goalInput);
      addChallenge({
        title: goalInput.trim(),
        emoji: '🎯',
        description: `Custom goal path: ${goalInput.trim()}`,
      }, generated);

      setGenerating(false);
      setGoalInput('');
      showToast(`AI Roadmap generated for "${goalInput.trim()}"! 🚀`, '🤖');
    }, 800);
  };

  const handleAddCustomMilestone = () => {
    if (!milestoneTitle.trim()) return;
    const finalTitle = stackedAfter.trim()
      ? `${milestoneTitle.trim()} (🔗 Stacked after "${stackedAfter}")`
      : milestoneTitle.trim();

    addMilestone({
      title: finalTitle,
      time: milestoneTime,
      duration: milestoneDuration,
      points: 30,
    });
    setMilestoneTitle('');
    setStackedAfter('');
    setShowAddMilestoneModal(false);
    showToast(stackedAfter ? `Habit Stacked after "${stackedAfter}"! 🔗` : 'Custom milestone added! 🏁', '✨');
  };

  return (
    <div className="tab-page">
      {showCreateGoalModal && (
        <CreateChallengeModal onClose={() => setShowCreateGoalModal(false)} />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Your Goals & Roadmaps</h1>
          <p className="page-subtitle">Conquer single or multiple goals simultaneously</p>
        </div>
      </div>

      {/* Multi-Goal Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div className="section-label" style={{ marginBottom: 0 }}>Active Goals</div>
        <button
          onClick={() => setShowCreateGoalModal(true)}
          style={{
            padding: '6px 12px',
            background: 'var(--accent-sky)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          <Plus size={14} /> New Goal
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {activeChallenges.map((c) => {
          const isSelected = c.id === selectedChallengeId;
          return (
            <div
              key={c.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px 6px 16px',
                borderRadius: '99px',
                background: isSelected ? 'var(--accent-sky)' : 'var(--bg-card)',
                border: `1.5px solid ${isSelected ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                boxShadow: isSelected ? '0 4px 16px rgba(14,165,233,0.3)' : 'var(--shadow-card)',
                flexShrink: 0,
              }}
            >
              <span
                onClick={() => selectChallenge(c.id)}
                style={{ cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
              >
                {c.emoji} {c.title}
              </span>
              {activeChallenges.length > 1 && (
                <button
                  onClick={() => {
                    deleteChallenge(c.id);
                    showToast(`Goal "${c.title}" deleted`, '🗑️');
                  }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: isSelected ? 'rgba(255,255,255,0.8)' : '#ef4444',
                    padding: '2px 4px', display: 'flex', alignItems: 'center',
                  }}
                  title="Delete Goal"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* AI & Custom Goal Input Card (FIXED CONTRAST & VISIBILITY) */}
      <div className="card card-violet mb-16" style={{ padding: '22px' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center gap-8 mb-12">
            <Wand2 size={18} color="#fde68a" />
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>✨ Generate New Goal Roadmap</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px', fontWeight: 600 }}>
            Type any goal or exam (e.g. GATE, NEET, IIT JEE, Board Exams, UPSC):
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              id="input-goal"
              placeholder="e.g. GATE 2026, NEET, Board Exams..."
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateAI()}
              style={{
                flex: 1,
                background: '#ffffff',
                color: '#0f172a',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '14px 16px',
                fontSize: '15px',
                fontWeight: 600,
                outline: 'none',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <button
              id="btn-generate-roadmap"
              onClick={handleGenerateAI}
              disabled={generating || !goalInput.trim()}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                padding: '0 20px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '54px',
                fontFamily: 'Outfit, sans-serif',
                opacity: !goalInput.trim() ? 0.6 : 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              {generating ? '...' : '→'}
            </button>
          </div>
        </div>
      </div>

      {/* Pre-trained Exam & Productivity Chips */}
      <div className="section-label">Trained Exam & Target Roadmaps</div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {PRESET_GOALS.map((p) => (
          <button
            key={p.id}
            onClick={() => handlePresetSelect(p.id)}
            style={{
              flexShrink: 0,
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              background: activePreset === p.id ? `${p.color}15` : 'var(--bg-card)',
              border: `1.5px solid ${activePreset === p.id ? p.color : 'var(--glass-border)'}`,
              borderRadius: '99px',
              color: activePreset === p.id ? p.color : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: 'var(--shadow-card)',
              transition: 'all 0.2s ease',
            }}
          >
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      {/* Sequence Milestones Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div className="section-label" style={{ marginBottom: 0 }}>Milestone Sequence</div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {completedCount}/{tasks.length} done
          </span>
        </div>

        {/* Add Milestone Button */}
        <button
          onClick={() => setShowAddMilestoneModal(true)}
          style={{
            padding: '8px 14px',
            background: 'var(--accent-sky)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: 'var(--shadow-button-sky)',
          }}
        >
          <Plus size={16} /> Add Milestone
        </button>
      </div>

      {/* Add Custom Milestone Modal */}
      {showAddMilestoneModal && (
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
              Add Important Milestone
            </h3>

            <div className="section-label">Milestone Title</div>
            <input
              className="flux-input mb-16"
              placeholder="e.g. Chapter 4 Practice Problems"
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
            />

            <div className="section-label">Habit Stacking Chain (Triggers After)</div>
            <select
              className="flux-input mb-16"
              style={{ fontSize: '13px' }}
              value={stackedAfter}
              onChange={(e) => setStackedAfter(e.target.value)}
            >
              <option value="">(None - Standalone Milestone)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.title}>
                  🔗 After: "{t.title}"
                </option>
              ))}
            </select>

            <div className="grid-2 mb-24">
              <div>
                <div className="section-label">Scheduled Time</div>
                <input
                  className="flux-input"
                  value={milestoneTime}
                  onChange={(e) => setMilestoneTime(e.target.value)}
                />
              </div>
              <div>
                <div className="section-label">Duration</div>
                <input
                  className="flux-input"
                  value={milestoneDuration}
                  onChange={(e) => setMilestoneDuration(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowAddMilestoneModal(false)}
                className="btn btn-ghost flex-1"
                style={{ borderRadius: '16px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomMilestone}
                className="btn btn-primary flex-1"
                style={{ borderRadius: '16px' }}
              >
                Insert Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Sequence */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <div className="empty-title">No milestones set</div>
          <div className="empty-desc">Choose a trained exam roadmap above or add your custom milestone.</div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {tasks.map((task, index) => (
            <TimelineTask
              key={task.id}
              task={task}
              index={index}
              onComplete={handleComplete}
              onDelete={(mId) => {
                deleteMilestone(mId);
                showToast('Milestone deleted 🗑️', '✨');
              }}
              totalCompleted={completedCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
