import React, { useState } from 'react';
import { BookOpen, CheckSquare, Square, Plus, Trash2, ChevronDown, ChevronRight, Award, Sparkles, Filter } from 'lucide-react';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';

const PRELOADED_SYLLABUS = [
  {
    id: 's_gate_cs',
    title: 'GATE CSE & IT Core',
    category: 'Engineering',
    icon: '💻',
    units: [
      {
        id: 'u_dsa',
        name: 'Data Structures & Algorithms',
        topics: [
          { id: 't_dsa_1', title: 'Arrays, Stacks, Queues & Linked Lists', completed: true },
          { id: 't_dsa_2', title: 'Trees, Binary Search Trees & Heaps', completed: true },
          { id: 't_dsa_3', title: 'Graph Traversals (BFS, DFS, Dijkstra, MST)', completed: false },
          { id: 't_dsa_4', title: 'Sorting & Searching Algorithms', completed: false },
          { id: 't_dsa_5', title: 'Dynamic Programming & Greedy Strategies', completed: false },
        ]
      },
      {
        id: 'u_os',
        name: 'Operating Systems',
        topics: [
          { id: 't_os_1', title: 'Process Management, Threads & CPU Scheduling', completed: true },
          { id: 't_os_2', title: 'Process Synchronization, Semaphores & Deadlocks', completed: false },
          { id: 't_os_3', title: 'Memory Management, Paging & Virtual Memory', completed: false },
          { id: 't_os_4', title: 'File Systems & Disk Scheduling Algorithms', completed: false },
        ]
      },
      {
        id: 'u_dbms',
        name: 'Database Management Systems',
        topics: [
          { id: 't_dbms_1', title: 'ER Model, Relational Algebra & SQL Queries', completed: true },
          { id: 't_dbms_2', title: 'Normalization (1NF, 2NF, 3NF, BCNF)', completed: false },
          { id: 't_dbms_3', title: 'Transactions, ACID Properties & Concurrency Control', completed: false },
          { id: 't_dbms_4', title: 'B & B+ Trees Indexing Techniques', completed: false },
        ]
      },
    ]
  },
  {
    id: 's_gate_maths',
    title: 'Engineering Mathematics & Aptitude',
    category: 'Mathematics',
    icon: '📐',
    units: [
      {
        id: 'u_la',
        name: 'Linear Algebra & Calculus',
        topics: [
          { id: 't_la_1', title: 'Matrices, Determinants & Eigenvalues', completed: true },
          { id: 't_la_2', title: 'Limits, Continuity & Differentiation', completed: true },
          { id: 't_la_3', title: 'Integration, Definite Integrals & Vector Calculus', completed: false },
        ]
      },
      {
        id: 'u_apt',
        name: 'General Quantitative & Verbal Aptitude',
        topics: [
          { id: 't_apt_1', title: 'Percentages, Profit/Loss & Ratio/Proportion', completed: true },
          { id: 't_apt_2', title: 'Speed, Distance, Time & Work', completed: true },
          { id: 't_apt_3', title: 'Permutations, Combinations & Probability', completed: false },
          { id: 't_apt_4', title: 'Data Interpretation & Logical Reasoning', completed: false },
        ]
      }
    ]
  },
  {
    id: 's_jee_physics',
    title: 'JEE / NEET Fundamental Science',
    category: 'Science',
    icon: '⚡',
    units: [
      {
        id: 'u_mech',
        name: 'Mechanics & Thermodynamics',
        topics: [
          { id: 't_m_1', title: 'Kinematics & Newton Laws of Motion', completed: true },
          { id: 't_m_2', title: 'Work, Energy, Power & Rotational Dynamics', completed: false },
          { id: 't_m_3', title: 'Laws of Thermodynamics & Heat Engines', completed: false },
        ]
      }
    ]
  }
];

export default function SyllabusTracker() {
  const [syllabusList, setSyllabusList] = useState(() => {
    const saved = localStorage.getItem('flux_syllabus_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return PRELOADED_SYLLABUS;
  });

  const [activeSubjectId, setActiveSubjectId] = useState(PRELOADED_SYLLABUS[0].id);
  const [expandedUnits, setExpandedUnits] = useState({});
  
  // Custom Topic Modal State
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');

  // Save changes to localStorage
  const saveSyllabus = (updated) => {
    setSyllabusList(updated);
    localStorage.setItem('flux_syllabus_data', JSON.stringify(updated));
  };

  const activeSubject = syllabusList.find((s) => s.id === activeSubjectId) || syllabusList[0];

  // Calculate completion metrics
  const totalTopics = (activeSubject?.units || []).reduce((acc, u) => acc + (u.topics?.length || 0), 0);
  const completedTopics = (activeSubject?.units || []).reduce(
    (acc, u) => acc + (u.topics || []).filter((t) => t.completed).length, 0
  );
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const toggleTopic = (unitId, topicId) => {
    const updated = syllabusList.map((sub) => {
      if (sub.id === activeSubjectId) {
        const updatedUnits = sub.units.map((u) => {
          if (u.id === unitId) {
            const updatedTopics = u.topics.map((t) => {
              if (t.id === topicId) {
                const nextState = !t.completed;
                if (nextState) {
                  showToast(`Topic completed! +15 pts 🎉`, '✨');
                  useStore.getState().addPoints(15);
                }
                return { ...t, completed: nextState };
              }
              return t;
            });
            return { ...u, topics: updatedTopics };
          }
          return u;
        });
        return { ...sub, units: updatedUnits };
      }
      return sub;
    });
    saveSyllabus(updated);
  };

  const toggleUnitExpand = (unitId) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleAddTopic = () => {
    if (!newTopicTitle.trim() || !selectedUnitId) return;
    const updated = syllabusList.map((sub) => {
      if (sub.id === activeSubjectId) {
        const updatedUnits = sub.units.map((u) => {
          if (u.id === selectedUnitId) {
            const newT = {
              id: `custom_t_${Date.now()}`,
              title: newTopicTitle.trim(),
              completed: false,
            };
            return { ...u, topics: [...u.topics, newT] };
          }
          return u;
        });
        return { ...sub, units: updatedUnits };
      }
      return sub;
    });
    saveSyllabus(updated);
    setNewTopicTitle('');
    setShowAddTopic(false);
    showToast('New topic added to syllabus! 📚', '✨');
  };

  return (
    <div className="tab-page" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '12px' }}>
        <span className="badge badge-primary" style={{ marginBottom: '8px', display: 'inline-flex' }}>
          Syllabus Mastery
        </span>
        <h1 className="page-title">Syllabus &amp; Topic Tracker</h1>
        <p className="page-subtitle">Track subjects, units, and topic completion for your exams</p>
      </div>

      {/* Subject Switcher Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {syllabusList.map((sub) => {
          const isSel = sub.id === activeSubjectId;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubjectId(sub.id)}
              style={{
                flex: 1, minWidth: '130px', padding: '12px 14px', borderRadius: '18px',
                background: isSel ? 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' : 'var(--bg-card)',
                color: isSel ? '#fff' : 'var(--text-secondary)',
                border: `1.5px solid ${isSel ? '#0ea5e9' : 'var(--glass-border)'}`,
                cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                boxShadow: isSel ? '0 10px 25px -5px rgba(14, 165, 233, 0.4)' : 'var(--shadow-card)',
                textAlign: 'left', transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{sub.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sub.title}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
                {sub.category}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Subject Progress Banner */}
      <div className="card card-dark mb-24" style={{ padding: '24px', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              {activeSubject?.icon} {activeSubject?.title}
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              {completedTopics} of {totalTopics} topics completed
            </p>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(14, 165, 233, 0.15)',
            border: '3px solid #0ea5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: 900, color: '#38bdf8',
          }}>
            {progressPercent}%
          </div>
        </div>

        {/* Progress Bar Track */}
        <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
            borderRadius: '99px', transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Unit & Topic List */}
      <div style={{ width: '100%' }}>
        {(activeSubject?.units || []).map((unit) => {
          const isExpanded = expandedUnits[unit.id] !== false; // Default expanded
          const unitTotal = unit.topics?.length || 0;
          const unitDone = (unit.topics || []).filter((t) => t.completed).length;

          return (
            <div 
              key={unit.id} 
              className="card mb-16" 
              style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}
            >
              {/* Unit Header */}
              <div 
                onClick={() => toggleUnitExpand(unit.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isExpanded ? <ChevronDown size={18} color="var(--accent-sky)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {unit.name}
                  </h3>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '99px' }}>
                  {unitDone}/{unitTotal} Done
                </div>
              </div>

              {/* Topics Check-list */}
              {isExpanded && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '8px' }}>
                  {(unit.topics || []).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTopic(unit.id, t.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px', borderRadius: '14px',
                        background: t.completed ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-secondary)',
                        border: `1px solid ${t.completed ? 'rgba(14, 165, 233, 0.25)' : 'transparent'}`,
                        cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                    >
                      {t.completed ? (
                        <CheckSquare size={20} color="#0ea5e9" style={{ flexShrink: 0 }} />
                      ) : (
                        <Square size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      )}
                      <span style={{
                        fontSize: '13px', fontWeight: 600,
                        color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: t.completed ? 'line-through' : 'none',
                        lineHeight: 1.4,
                      }}>
                        {t.title}
                      </span>
                    </div>
                  ))}

                  {/* Add Topic Button for Unit */}
                  <button
                    onClick={() => {
                      setSelectedUnitId(unit.id);
                      setShowAddTopic(true);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '10px', borderRadius: '12px',
                      background: 'transparent', border: '1px dashed var(--glass-border)',
                      color: 'var(--accent-sky)', fontSize: '12px', fontWeight: 700,
                      cursor: 'pointer', marginTop: '6px', justifyContent: 'center',
                    }}
                  >
                    <Plus size={14} /> Add Custom Topic to {unit.name}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Topic Modal */}
      {showAddTopic && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            width: '100%', maxWidth: '360px', background: 'var(--bg-card)',
            borderRadius: '24px', padding: '24px', border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-card-md)', textAlign: 'center',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Add New Topic
            </h3>
            <input
              type="text"
              placeholder="e.g. Graph Colorining & NP-Hardness"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '14px',
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
                marginBottom: '16px', fontFamily: 'Outfit, sans-serif',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowAddTopic(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '14px',
                  background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                  border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTopic}
                style={{
                  flex: 1, padding: '12px', borderRadius: '14px',
                  background: 'var(--accent-sky)', color: '#fff',
                  border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                }}
              >
                Save Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
