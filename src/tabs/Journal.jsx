import React, { useState } from 'react';
import { Star, Sparkles, Calendar, ChevronDown, ChevronUp, MessageSquare, Loader2, Edit3, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import { getJournalInsight } from '../mockAI';
import { showToast } from '../components/Toast';

function StarRating({ rating, onRate }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          id={`star-${n}`}
          className="star-btn"
          onClick={() => onRate(n)}
        >
          <Star
            size={24}
            className={n <= rating ? 'star-filled' : 'star-empty'}
            fill={n <= rating ? '#f59e0b' : 'none'}
            strokeWidth={n <= rating ? 0 : 2}
          />
        </button>
      ))}
    </div>
  );
}

function EntryCard({ entry }) {
  const editJournalEntry = useStore((s) => s.editJournalEntry);
  const deleteJournalEntry = useStore((s) => s.deleteJournalEntry);

  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(entry.text);
  const [editRating, setEditRating] = useState(entry.rating || 3);

  const date = new Date(entry.date);
  const formattedDate = date.toLocaleDateString('en', {
    month: 'short', day: 'numeric',
  });
  const weekday = date.toLocaleDateString('en', { weekday: 'long' });

  const dotColor =
    entry.rating >= 4 ? '#10b981' : entry.rating >= 3 ? '#f59e0b' : '#f43f5e';

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    editJournalEntry(entry.id, editText.trim(), editRating);
    setIsEditing(false);
    showToast('Journal entry updated! 📝', '✨');
  };

  const handleDelete = () => {
    deleteJournalEntry(entry.id);
    showToast('Journal entry deleted 🗑️', '✨');
  };

  return (
    <div className="card mb-12 interactive" style={{ padding: '18px 20px' }}>
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-12">
          {/* Colored dot */}
          <div style={{
            width: 10, height: 10,
            borderRadius: '50%',
            background: dotColor,
            boxShadow: `0 0 6px ${dotColor}60`,
            flexShrink: 0,
          }} />
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {weekday}, {formattedDate}
            </span>
            <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={13}
                  fill={n <= entry.rating ? '#f59e0b' : 'none'}
                  color={n <= entry.rating ? '#f59e0b' : 'var(--glass-border)'}
                  strokeWidth={0}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center',
            }}
            title="Edit Entry"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={handleDelete}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              borderRadius: '12px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: '#ef4444',
              display: 'flex', alignItems: 'center',
            }}
            title="Delete Entry"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center',
            }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Edit Entry Inline Modal */}
      {isEditing ? (
        <div style={{ padding: '8px 0' }}>
          <textarea
            className="flux-input mb-12"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <StarRating rating={editRating} onRate={setEditRating} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary btn-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p style={{
          fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.65, fontWeight: 600,
          overflow: 'hidden',
          maxHeight: expanded ? '400px' : '42px',
          transition: 'max-height 0.35s ease',
        }}>
          {entry.text}
        </p>
      )}

      {expanded && entry.aiInsight && !isEditing && (
        <div style={{
          marginTop: '14px',
          background: 'rgba(124, 58, 237, 0.12)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '16px',
          padding: '14px 16px',
          animation: 'fadeInUp 0.3s ease',
        }}>
          <div className="flex items-center gap-8 mb-8">
            <div style={{
              width: 32, height: 32,
              background: 'var(--accent-violet)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
              flexShrink: 0,
            }}>
              <MessageSquare size={16} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#c084fc' }}>
              AI Insight
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.65, fontWeight: 500 }}>
            {entry.aiInsight}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Journal() {
  const journalEntries = useStore((s) => s.journalEntries);
  const addJournalEntry = useStore((s) => s.addJournalEntry);

  const [text, setText] = useState('');
  const [rating, setRating] = useState(3);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      addJournalEntry(text, rating, getJournalInsight());
      setText('');
      setRating(3);
      setAnalyzing(false);
      showToast('Entry saved with AI insight 📖', '✨');
    }, 1100);
  };

  const handleSave = () => {
    if (!text.trim()) return;
    addJournalEntry(text, rating, null);
    setText('');
    setRating(3);
    showToast('Journal entry saved 📝', '📖');
  };

  const totalEntries = journalEntries.length;
  const avgRating = totalEntries > 0
    ? (journalEntries.reduce((a, e) => a + (e.rating || 3), 0) / totalEntries).toFixed(1)
    : '—';

  return (
    <div className="tab-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingTop: '12px' }}>
        <div>
          <h1 className="page-title">Journal</h1>
          <p className="page-subtitle">Log your wins and thoughts.</p>
        </div>
        <button
          id="btn-analyze-header"
          onClick={handleAnalyze}
          disabled={!text.trim() || analyzing}
          style={{
            background: analyzing ? '#f5f3ff' : '#ede9fe',
            color: '#7c3aed',
            border: 'none',
            borderRadius: '14px',
            padding: '10px 16px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '6px',
            cursor: !text.trim() || analyzing ? 'default' : 'pointer',
            opacity: !text.trim() ? 0.5 : 1,
            fontFamily: 'Outfit, sans-serif',
            transition: 'all 0.2s ease',
          }}
        >
          {analyzing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
          Analyze
        </button>
      </div>

      {/* Stats */}
      <div className="grid-2 mb-16">
        <div className="card text-center" style={{ padding: '18px' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
            {totalEntries}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Total Entries</div>
        </div>
        <div className="card text-center" style={{ padding: '18px' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>
            ⭐ {avgRating}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Avg Rating</div>
        </div>
      </div>

      {/* New Entry Card */}
      <div className="card card-sky-tint mb-24" style={{ padding: '22px 24px' }}>
        <textarea
          id="journal-input"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: 1.65,
            resize: 'none',
            minHeight: '90px',
          }}
          placeholder="What did you achieve today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: '14px', borderTop: '1px solid var(--glass-border)',
          marginTop: '8px',
        }}>
          <StarRating rating={rating} onRate={setRating} />
          <button
            id="btn-save-entry"
            onClick={handleSave}
            disabled={!text.trim()}
            style={{
              background: 'var(--accent-sky)',
              color: '#fff',
              border: 'none',
              borderRadius: '18px',
              padding: '12px 22px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: !text.trim() ? 'default' : 'pointer',
              opacity: !text.trim() ? 0.3 : 1,
              fontFamily: 'Outfit, sans-serif',
              boxShadow: 'var(--shadow-button-sky)',
              transition: 'all 0.2s ease',
            }}
          >
            Save Log
          </button>
        </div>
      </div>

      {/* History */}
      <div className="section-label">Past Entries</div>

      {journalEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <div className="empty-title">No entries yet</div>
          <div className="empty-desc">Write your first journal entry above to start tracking your journey.</div>
        </div>
      ) : (
        journalEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))
      )}
    </div>
  );
}
