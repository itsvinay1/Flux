import React, { useState } from 'react';
import {
  CheckSquare, Square, Trash2, Plus, ListTodo,
  Clock, AlertCircle, CheckCheck
} from 'lucide-react';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';

const PRIORITIES = [
  { id: 'high',   label: 'High',   color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.2)'   },
  { id: 'medium', label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  { id: 'low',    label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
];

function priorityOf(p) {
  return PRIORITIES.find((x) => x.id === p) || PRIORITIES[1];
}

export default function TodoList() {
  const todos = useStore((s) => s.todos) || [];
  const addTodo = useStore((s) => s.addTodo);
  const toggleTodo = useStore((s) => s.toggleTodo);
  const deleteTodo = useStore((s) => s.deleteTodo);

  const [inputTitle, setInputTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;
    addTodo(inputTitle.trim(), priority, 'General');
    setInputTitle('');
    showToast('Task added', 'check');
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const pending = todos.filter((t) => !t.completed).length;
  const completed = todos.filter((t) => t.completed).length;

  const FILTERS = [
    { id: 'all', label: 'All', count: todos.length },
    { id: 'pending', label: 'Pending', count: pending },
    { id: 'completed', label: 'Done', count: completed },
  ];

  return (
    <div className="tab-page">
      {/* Fixed header */}
      <div className="sticky-screen-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '19px', fontWeight: 800 }}>Task Board</h1>
          <p className="page-subtitle" style={{ fontSize: '11px', margin: 0 }}>
            {pending} pending &bull; {completed} done
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{todos.length}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>Total</div>
        </div>
        <div className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{pending}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>Pending</div>
        </div>
        <div className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{completed}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>Done</div>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="card" style={{ padding: '18px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
          <Plus size={15} color="var(--accent-sky)" /> Add New Task
        </h3>
        <form onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 12,
              background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box', marginBottom: 10,
            }}
          />

          {/* Priority selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                style={{
                  flex: 1, padding: '7px 4px', borderRadius: 10,
                  border: `1.5px solid ${priority === p.id ? p.color : 'var(--glass-border)'}`,
                  background: priority === p.id ? p.bg : 'transparent',
                  color: priority === p.id ? p.color : 'var(--text-muted)',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s ease',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!inputTitle.trim()}
            style={{
              width: '100%', padding: '11px', borderRadius: 12,
              background: inputTitle.trim() ? 'var(--accent-sky)' : 'var(--bg-secondary)',
              color: inputTitle.trim() ? '#fff' : 'var(--text-muted)',
              border: 'none', fontWeight: 800, fontSize: 13, cursor: inputTitle.trim() ? 'pointer' : 'default',
              fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s ease',
            }}
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--bg-secondary)', padding: 4, borderRadius: 14 }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              flex: 1, padding: '7px 8px', borderRadius: 10, border: 'none',
              background: filter === f.id ? 'var(--bg-card)' : 'transparent',
              color: filter === f.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s ease',
              boxShadow: filter === f.id ? 'var(--shadow-card)' : 'none',
            }}
          >
            {f.label}
            <span style={{
              marginLeft: 5, background: filter === f.id ? 'var(--accent-sky)' : 'var(--bg-secondary)',
              color: filter === f.id ? '#fff' : 'var(--text-muted)',
              fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 99,
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {filteredTodos.length === 0 ? (
        <div className="card text-center" style={{ padding: '36px 24px' }}>
          <ListTodo size={36} style={{ margin: '0 auto 10px', opacity: 0.35, color: 'var(--text-muted)' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
            {filter === 'completed' ? 'No completed tasks yet.' : 'No tasks here. Add one above.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredTodos.map((todo) => {
            const prio = priorityOf(todo.priority);
            return (
              <div
                key={todo.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px', borderRadius: 14,
                  background: todo.completed ? 'rgba(14,165,233,0.04)' : 'var(--bg-card)',
                  border: `1px solid ${todo.completed ? 'rgba(14,165,233,0.15)' : 'var(--glass-border)'}`,
                  boxShadow: 'var(--shadow-card)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Tick / checkbox */}
                <div
                  onClick={() => toggleTodo(todo.id)}
                  style={{ cursor: 'pointer', flexShrink: 0, display: 'flex' }}
                >
                  {todo.completed ? (
                    <div style={{
                      width: 22, height: 22, borderRadius: 7,
                      background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(14,165,233,0.35)',
                    }}>
                      <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                        <path d="M2.5 6.5L5.5 9.5L10.5 4" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : (
                    <div style={{
                      width: 22, height: 22, borderRadius: 7,
                      border: `1.5px solid ${prio.color}`,
                      background: prio.bg,
                    }} />
                  )}
                </div>

                {/* Priority dot */}
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: prio.color, flexShrink: 0,
                  opacity: todo.completed ? 0.3 : 1,
                }} />

                {/* Label */}
                <span
                  onClick={() => toggleTodo(todo.id)}
                  style={{
                    flex: 1, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                  }}
                >
                  {todo.title}
                </span>

                {/* Priority label */}
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 6,
                  background: prio.bg, color: prio.color, border: `1px solid ${prio.border}`,
                  flexShrink: 0,
                }}>
                  {prio.label}
                </span>

                {/* Delete */}
                <button
                  onClick={() => { deleteTodo(todo.id); showToast('Task removed', 'info'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0, opacity: 0.6 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
