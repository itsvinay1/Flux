import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  BookOpen, CheckSquare, Square, Plus, Trash2, Edit3, ChevronDown, 
  ChevronRight, MoreVertical, X, Folder, AlertTriangle, Check
} from 'lucide-react';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

export default function SyllabusTracker() {
  const courses = useStore((s) => s.courses) || [];
  const addCourse = useStore((s) => s.addCourse);
  const editCourse = useStore((s) => s.editCourse);
  const deleteCourse = useStore((s) => s.deleteCourse);

  const addSubject = useStore((s) => s.addSubject);
  const editSubject = useStore((s) => s.editSubject);
  const deleteSubject = useStore((s) => s.deleteSubject);

  const addChapter = useStore((s) => s.addChapter);
  const editChapter = useStore((s) => s.editChapter);
  const deleteChapter = useStore((s) => s.deleteChapter);

  const addTopic = useStore((s) => s.addTopic);
  const editTopic = useStore((s) => s.editTopic);
  const deleteTopic = useStore((s) => s.deleteTopic);

  const addSubTopic = useStore((s) => s.addSubTopic);
  const editSubTopic = useStore((s) => s.editSubTopic);
  const deleteSubTopic = useStore((s) => s.deleteSubTopic);
  const toggleSubTopicComplete = useStore((s) => s.toggleSubTopicComplete);

  const [activeCourseId, setActiveCourseId] = useState(courses[0]?.id || '');
  const [activeSubjectId, setActiveSubjectId] = useState('');

  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  // Modals state
  const [modalType, setModalType] = useState(null); // 'addCourse' | 'addSubject' | 'addChapter' | 'addTopic' | 'addSubTopic' | 'deleteConfirm' | 'editItem'
  const [modalData, setModalData] = useState({});
  const [inputTitle, setInputTitle] = useState('');
  const [inputIcon, setInputIcon] = useState('');

  // Modern Action Sheet state
  const [actionSheet, setActionSheet] = useState(null); // { title, subtitle, actions: [{ label, icon, onClick, danger }] }

  useEffect(() => {
    if (modalType || actionSheet) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [modalType, actionSheet]);

  const currentCourse = courses.find((c) => c.id === activeCourseId) || courses[0];
  const activeSubjects = currentCourse?.subjects || [];
  const currentSubject = activeSubjects.find((s) => s.id === activeSubjectId) || activeSubjects[0];

  // Helper calculations for progress
  const getSubjectMetrics = (subject) => {
    let total = 0;
    let completed = 0;
    (subject?.chapters || []).forEach((ch) => {
      (ch.topics || []).forEach((tp) => {
        (tp.subTopics || []).forEach((st) => {
          total += 1;
          if (st.completed) completed += 1;
        });
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  const currentSubjectMetrics = getSubjectMetrics(currentSubject);

  // Toggle chapter & topic expansion
  const toggleChapter = (id) => setExpandedChapters((p) => ({ ...p, [id]: !p[id] }));
  const toggleTopicExpand = (id) => setExpandedTopics((p) => ({ ...p, [id]: !p[id] }));

  // Modal Submissions
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    if (modalType === 'addCourse') {
      addCourse(inputTitle.trim(), 'General', inputIcon || '📚');
      showToast('Course created', 'check');
    } else if (modalType === 'addSubject') {
      addSubject(currentCourse.id, inputTitle.trim(), inputIcon || '📘');
      showToast('Subject added', 'check');
    } else if (modalType === 'addChapter') {
      addChapter(currentCourse.id, modalData.subjectId, inputTitle.trim());
      showToast('Chapter added', 'check');
    } else if (modalType === 'addTopic') {
      addTopic(currentCourse.id, modalData.subjectId, modalData.chapterId, inputTitle.trim());
      showToast('Topic added', 'check');
    } else if (modalType === 'addSubTopic') {
      addSubTopic(currentCourse.id, modalData.subjectId, modalData.chapterId, modalData.topicId, inputTitle.trim());
      showToast('Sub-topic added', 'check');
    } else if (modalType === 'editItem') {
      const { level, courseId, subjectId, chapterId, topicId, subTopicId } = modalData;
      if (level === 'course') editCourse(courseId, { title: inputTitle.trim(), icon: inputIcon || '📚' });
      else if (level === 'subject') editSubject(courseId, subjectId, { title: inputTitle.trim(), icon: inputIcon || '📘' });
      else if (level === 'chapter') editChapter(courseId, subjectId, chapterId, { title: inputTitle.trim() });
      else if (level === 'topic') editTopic(courseId, subjectId, chapterId, topicId, { title: inputTitle.trim() });
      else if (level === 'subTopic') editSubTopic(courseId, subjectId, chapterId, topicId, subTopicId, { title: inputTitle.trim() });
      showToast('Updated successfully', 'check');
    }

    setModalType(null);
    setInputTitle('');
    setInputIcon('');
  };

  const handleConfirmDelete = () => {
    const { level, courseId, subjectId, chapterId, topicId, subTopicId } = modalData;
    if (level === 'course') deleteCourse(courseId);
    else if (level === 'subject') deleteSubject(courseId, subjectId);
    else if (level === 'chapter') deleteChapter(courseId, subjectId, chapterId);
    else if (level === 'topic') deleteTopic(courseId, subjectId, chapterId, topicId);
    else if (level === 'subTopic') deleteSubTopic(courseId, subjectId, chapterId, topicId, subTopicId);
    
    showToast('Deleted successfully', '🗑️');
    setModalType(null);
  };

  // Quick Action Sheet Trigger Helpers
  const openSubjectMenu = (sub) => {
    setActionSheet({
      title: `${sub.icon || '📘'} ${sub.title}`,
      subtitle: 'Subject Options',
      actions: [
        {
          label: 'Add Chapter',
          icon: '➕',
          onClick: () => {
            setModalType('addChapter');
            setModalData({ subjectId: sub.id });
            setInputTitle('');
          }
        },
        {
          label: 'Edit Subject Name & Icon',
          icon: '✏️',
          onClick: () => {
            setModalType('editItem');
            setModalData({ level: 'subject', courseId: currentCourse.id, subjectId: sub.id });
            setInputTitle(sub.title);
            setInputIcon(sub.icon || '📘');
          }
        },
        {
          label: 'Delete Subject',
          icon: '🗑️',
          danger: true,
          onClick: () => {
            setModalType('deleteConfirm');
            setModalData({ level: 'subject', courseId: currentCourse.id, subjectId: sub.id, title: sub.title });
          }
        }
      ]
    });
  };

  const openChapterMenu = (chap) => {
    setActionSheet({
      title: `📖 ${chap.title}`,
      subtitle: 'Chapter Options',
      actions: [
        {
          label: 'Add New Topic',
          icon: '➕',
          onClick: () => {
            setModalType('addTopic');
            setModalData({ subjectId: currentSubject.id, chapterId: chap.id });
            setInputTitle('');
          }
        },
        {
          label: 'Edit Chapter Title',
          icon: '✏️',
          onClick: () => {
            setModalType('editItem');
            setModalData({ level: 'chapter', courseId: currentCourse.id, subjectId: currentSubject.id, chapterId: chap.id });
            setInputTitle(chap.title);
          }
        },
        {
          label: 'Delete Chapter',
          icon: '🗑️',
          danger: true,
          onClick: () => {
            setModalType('deleteConfirm');
            setModalData({ level: 'chapter', courseId: currentCourse.id, subjectId: currentSubject.id, chapterId: chap.id, title: chap.title });
          }
        }
      ]
    });
  };

  const openTopicMenu = (top, chapId) => {
    setActionSheet({
      title: `📝 ${top.title}`,
      subtitle: 'Topic Options',
      actions: [
        {
          label: 'Add Sub-topic Checklist Item',
          icon: '➕',
          onClick: () => {
            setModalType('addSubTopic');
            setModalData({ subjectId: currentSubject.id, chapterId: chapId, topicId: top.id });
            setInputTitle('');
          }
        },
        {
          label: 'Edit Topic Title',
          icon: '✏️',
          onClick: () => {
            setModalType('editItem');
            setModalData({ level: 'topic', courseId: currentCourse.id, subjectId: currentSubject.id, chapterId: chapId, topicId: top.id });
            setInputTitle(top.title);
          }
        },
        {
          label: 'Delete Topic',
          icon: '🗑️',
          danger: true,
          onClick: () => {
            setModalType('deleteConfirm');
            setModalData({ level: 'topic', courseId: currentCourse.id, subjectId: currentSubject.id, chapterId: chapId, topicId: top.id, title: top.title });
          }
        }
      ]
    });
  };

  const openSubTopicMenu = (st, chapId, topId) => {
    setActionSheet({
      title: st.title,
      subtitle: 'Sub-topic Options',
      actions: [
        {
          label: 'Edit Title',
          icon: '✏️',
          onClick: () => {
            setModalType('editItem');
            setModalData({ level: 'subTopic', courseId: currentCourse.id, subjectId: currentSubject.id, chapterId: chapId, topicId: topId, subTopicId: st.id });
            setInputTitle(st.title);
          }
        },
        {
          label: 'Delete Sub-topic',
          icon: '🗑️',
          danger: true,
          onClick: () => {
            setModalType('deleteConfirm');
            setModalData({ level: 'subTopic', courseId: currentCourse.id, subjectId: currentSubject.id, chapterId: chapId, topicId: topId, subTopicId: st.id, title: st.title });
          }
        }
      ]
    });
  };

  return (
    <div className="tab-page" style={{ paddingBottom: '120px' }}>
      
      {/* ── Fixed Sticky Screen Header ── */}
      <div className="sticky-screen-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '19px', fontWeight: 800 }}>Syllabus Tracker</h1>
          <p className="page-subtitle" style={{ fontSize: '11px', margin: 0 }}>Step-by-step syllabus mastery</p>
        </div>
        <button
          onClick={() => {
            setModalType('addCourse');
            setInputTitle('');
            setInputIcon('🎓');
          }}
          style={{
            padding: '7px 13px', borderRadius: '12px', fontSize: '12px', fontWeight: 800,
            background: 'var(--accent-sky)', color: '#fff', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            boxShadow: 'var(--shadow-button-sky)', fontFamily: 'Outfit, sans-serif',
          }}
        >
          <Plus size={14} /> Course
        </button>
      </div>

      {/* ── Course Switcher Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
        {courses.map((c) => {
          const isSel = c.id === (currentCourse?.id);
          return (
            <button
              key={c.id}
              onClick={() => { setActiveCourseId(c.id); setActiveSubjectId(''); }}
              style={{
                padding: '7px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
                background: isSel ? 'var(--accent-sky)' : 'var(--bg-card)',
                border: `1.5px solid ${isSel ? 'var(--accent-sky)' : 'var(--glass-border)'}`,
                color: isSel ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              <span>{c.icon || '📚'}</span> {c.title}
            </button>
          );
        })}
      </div>

      {/* ── Subject Horizontal Cards ── */}
      {currentCourse && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {activeSubjects.map((sub) => {
            const isSel = sub.id === (currentSubject?.id || activeSubjects[0]?.id);
            const metrics = getSubjectMetrics(sub);
            return (
              <div
                key={sub.id}
                onClick={() => setActiveSubjectId(sub.id)}
                style={{
                  minWidth: '135px', padding: '12px 14px', borderRadius: '16px',
                  background: isSel ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : 'var(--bg-card)',
                  color: isSel ? '#fff' : 'var(--text-secondary)',
                  border: `1.5px solid ${isSel ? '#0ea5e9' : 'var(--glass-border)'}`,
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  boxShadow: isSel ? '0 8px 20px -4px rgba(14, 165, 233, 0.35)' : 'var(--shadow-card)',
                  transition: 'all 0.2s ease', position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>{sub.icon || '📘'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSubjectMenu(sub);
                    }}
                    style={{
                      background: 'transparent', border: 'none',
                      color: isSel ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)',
                      cursor: 'pointer', padding: '2px', display: 'flex',
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sub.title}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.85, marginTop: '2px' }}>
                  {metrics.completed}/{metrics.total} ({metrics.percent}%)
                </div>
              </div>
            );
          })}

          <button
            onClick={() => {
              setModalType('addSubject');
              setInputTitle('');
              setInputIcon('📘');
            }}
            style={{
              padding: '12px 16px', borderRadius: '16px', minWidth: '95px',
              background: 'var(--bg-card)', border: '1px dashed var(--glass-border)',
              color: 'var(--accent-sky)', fontSize: '11px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              gap: '4px', fontFamily: 'Outfit, sans-serif',
            }}
          >
            <Plus size={16} />
            <span>Add Subject</span>
          </button>
        </div>
      )}

      {/* ── Active Subject Progress Header ── */}
      {currentSubject && (
        <div className="card mb-16" style={{ padding: '16px 18px', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{currentSubject.icon || '📘'}</span>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {currentSubject.title}
                </h2>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                  {currentSubjectMetrics.completed} of {currentSubjectMetrics.total} Sub-topics Completed
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--accent-sky)' }}>
                {currentSubjectMetrics.percent}%
              </span>
              <button
                onClick={() => openSubjectMenu(currentSubject)}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)', borderRadius: '10px', padding: '6px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          <div style={{ height: '6px', width: '100%', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${currentSubjectMetrics.percent}%`,
              background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)',
              borderRadius: '4px', transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* ── Chapters & Content Tree ── */}
      {currentSubject && (
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div className="section-label" style={{ marginBottom: 0 }}>Chapters &amp; Topics</div>
            <button
              onClick={() => {
                setModalType('addChapter');
                setModalData({ subjectId: currentSubject.id });
                setInputTitle('');
              }}
              style={{
                fontSize: '11px', fontWeight: 800, color: 'var(--accent-sky)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Outfit, sans-serif',
              }}
            >
              <Plus size={14} /> Add Chapter
            </button>
          </div>

          {/* Chapters List */}
          {(currentSubject.chapters || []).length === 0 ? (
            <div className="card text-center" style={{ padding: '24px', color: 'var(--text-muted)' }}>
              <Folder size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '13px', fontWeight: 600 }}>No chapters added yet.</p>
              <button
                onClick={() => {
                  setModalType('addChapter');
                  setModalData({ subjectId: currentSubject.id });
                  setInputTitle('');
                }}
                className="btn btn-primary"
                style={{ marginTop: '12px', fontSize: '12px', padding: '8px 16px', borderRadius: '12px' }}
              >
                + Add First Chapter
              </button>
            </div>
          ) : (
            (currentSubject.chapters || []).map((chap) => {
              const isChapExpanded = expandedChapters[chap.id] !== false;

              return (
                <div 
                  key={chap.id} 
                  className="card mb-12"
                  style={{ padding: '14px 16px', background: 'var(--bg-card)' }}
                >
                  {/* Chapter Level Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div 
                      onClick={() => toggleChapter(chap.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
                    >
                      {isChapExpanded ? <ChevronDown size={18} color="var(--accent-sky)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                      <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        📖 {chap.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => openChapterMenu(chap)}
                      style={{
                        background: 'transparent', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer',
                        padding: '4px', display: 'flex',
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {/* Topics List */}
                  {isChapExpanded && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '10px', borderLeft: '2px solid var(--glass-border)' }}>
                      {(chap.topics || []).length === 0 ? (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                          No topics yet. Tap ⋮ on the chapter to add a topic.
                        </p>
                      ) : (
                        (chap.topics || []).map((top) => {
                          const isTopExpanded = expandedTopics[top.id] !== false;

                          return (
                            <div key={top.id} style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '10px 12px' }}>
                              {/* Topic Header */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div 
                                  onClick={() => toggleTopicExpand(top.id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flex: 1 }}
                                >
                                  {isTopExpanded ? <ChevronDown size={15} color="var(--accent-sky)" /> : <ChevronRight size={15} color="var(--text-muted)" />}
                                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    📝 {top.title}
                                  </span>
                                </div>

                                <button
                                  onClick={() => openTopicMenu(top, chap.id)}
                                  style={{
                                    background: 'transparent', border: 'none',
                                    color: 'var(--text-muted)', cursor: 'pointer',
                                    padding: '2px', display: 'flex',
                                  }}
                                >
                                  <MoreVertical size={15} />
                                </button>
                              </div>

                              {/* Sub-topics List */}
                              {isTopExpanded && (
                                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px', paddingLeft: '8px' }}>
                                  {(top.subTopics || []).map((st) => (
                                    <div
                                      key={st.id}
                                      style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '7px 9px', borderRadius: '8px',
                                        background: st.completed ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-card)',
                                        border: `1px solid ${st.completed ? 'rgba(14, 165, 233, 0.2)' : 'var(--glass-border)'}`,
                                      }}
                                    >
                                      <div 
                                        onClick={() => toggleSubTopicComplete(currentCourse.id, currentSubject.id, chap.id, top.id, st.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
                                      >
                                        {st.completed ? (
                                          <CheckSquare size={15} color="#0ea5e9" style={{ flexShrink: 0 }} />
                                        ) : (
                                          <Square size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                        )}
                                        <span style={{
                                          fontSize: '12px', fontWeight: 600,
                                          color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                          textDecoration: st.completed ? 'line-through' : 'none',
                                        }}>
                                          {st.title}
                                        </span>
                                      </div>

                                      <button
                                        onClick={() => openSubTopicMenu(st, chap.id, top.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                                      >
                                        <MoreVertical size={13} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Modern Bottom Action Sheet Modal ── */}
      {actionSheet && createPortal(
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            background: 'rgba(10, 16, 30, 0.65)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            overscrollBehavior: 'none',
            touchAction: 'none',
          }}
          onClick={() => setActionSheet(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', borderRadius: '24px 24px 0 0',
              width: '100%', maxWidth: '480px',
              padding: '20px 24px calc(36px + env(safe-area-inset-bottom, 16px))',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              touchAction: 'pan-y',
              borderTop: '1px solid var(--glass-border)',
            }}
          >
            <div style={{ width: 36, height: 4, background: 'var(--glass-border)', borderRadius: 4, margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>
                  {actionSheet.title}
                </div>
                {actionSheet.subtitle && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {actionSheet.subtitle}
                  </div>
                )}
              </div>
              <button onClick={() => setActionSheet(null)} aria-label="Close" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {actionSheet.actions.map((act, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActionSheet(null);
                    act.onClick();
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '13px 16px', borderRadius: '14px',
                    background: act.danger ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-secondary)',
                    border: 'none', cursor: 'pointer',
                    color: act.danger ? '#ef4444' : 'var(--text-primary)',
                    fontWeight: 700, fontSize: '13px', fontFamily: 'Outfit, sans-serif',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{act.icon}</span>
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── CRUD Modals (Add / Edit / Delete Confirmation) ── */}
      {modalType && createPortal(
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            overscrollBehavior: 'none',
            touchAction: 'none',
          }}
          onClick={() => setModalType(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '360px', background: 'var(--bg-card)',
              borderRadius: '24px', padding: '24px', border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-card-md)', textAlign: 'center',
              touchAction: 'pan-y',
              animation: 'fadeInUp 0.25s ease',
            }}
          >
            {modalType === 'deleteConfirm' ? (
              <div>
                <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Delete Item?
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Are you sure you want to delete <strong>"{modalData.title}"</strong> and all nested content?
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setModalType(null)}
                    style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    style={{ flex: 1, padding: '12px', borderRadius: '14px', background: '#ef4444', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {modalType === 'editItem' ? 'Edit Item' : `Add New ${modalType.replace('add', '')}`}
                </h3>
                {modalType === 'addCourse' || modalType === 'addSubject' ? (
                  <input
                    type="text"
                    placeholder="Icon (e.g. 📘)"
                    value={inputIcon}
                    onChange={(e) => setInputIcon(e.target.value)}
                    maxLength={4}
                    className="flux-input mb-12"
                  />
                ) : null}
                <input
                  type="text"
                  placeholder="Title / Name..."
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  required
                  className="flux-input mb-20"
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'var(--accent-sky)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
