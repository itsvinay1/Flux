import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { writeData } from '../sync/syncManager';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

// ─── Level System ─────────────────────────────────────────────────────────────
const LEVEL_THRESHOLDS = [0, 300, 800, 1800, 3500, 6000, 10000, 16000, 25000, 38000, 55000];
const LEVEL_NAMES = [
  '', 'Novice', 'Apprentice', 'Focused', 'Disciplined',
  'Flow State', 'Iron Mind', 'Legend', 'Unstoppable', 'Ascended', 'Flux Master',
];

export function getLevel(points) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}
export function getLevelName(points) {
  return LEVEL_NAMES[getLevel(points)] || 'Flux Master';
}
export function getNextLevelPoints(points) {
  const level = getLevel(points);
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}
export function getCurrentLevelPoints(points) {
  const level = getLevel(points);
  return LEVEL_THRESHOLDS[level - 1] ?? 0;
}

// ─── Achievements Definition ──────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'streak_3',   emoji: '🔥', title: 'Spark',        desc: '3-day streak',       check: (s) => s.streak >= 3 },
  { id: 'streak_7',   emoji: '⚡', title: 'Week Warrior',  desc: '7-day streak',       check: (s) => s.streak >= 7 },
  { id: 'streak_14',  emoji: '💪', title: 'Fortnight',     desc: '14-day streak',      check: (s) => s.streak >= 14 },
  { id: 'streak_30',  emoji: '🏆', title: '30-Day Legend', desc: '30-day streak',      check: (s) => s.streak >= 30 },
  { id: 'streak_60',  emoji: '👑', title: 'Iron Streak',   desc: '60-day streak',      check: (s) => s.streak >= 60 },
  { id: 'focus_first',  emoji: '🎯', title: 'First Focus', desc: 'Complete first session',          check: (s) => s.focusSessions.some(f => f.hours > 0) },
  { id: 'focus_10h',    emoji: '⏱',  title: 'Centurion',   desc: '10 total focus hours',            check: (s) => s.focusSessions.reduce((a, f) => a + f.hours, 0) >= 10 },
  { id: 'focus_nodist', emoji: '🧘', title: 'Laser Mind',  desc: 'Complete session with 0 distractions', check: (s) => s.perfectFocusSessions > 0 },
  { id: 'journal_first', emoji: '📖', title: 'First Entry',  desc: 'Write first journal entry', check: (s) => s.journalEntries.length >= 1 },
  { id: 'journal_7',    emoji: '✍️',  title: 'Soul Writer',  desc: '7 journal entries',         check: (s) => s.journalEntries.length >= 7 },
  { id: 'journal_5star',emoji: '⭐',  title: 'Perfect Day',  desc: 'Log a 5-star day',          check: (s) => s.journalEntries.some(e => e.rating === 5) },
  { id: 'points_100',  emoji: '💎', title: 'First Hundred', desc: '100 points earned',   check: (s) => s.points >= 100 },
  { id: 'points_500',  emoji: '🥇', title: 'High Scorer',   desc: '500 points earned',   check: (s) => s.points >= 500 },
  { id: 'points_1000', emoji: '🚀', title: 'Point Master',  desc: '1000 points earned',  check: (s) => s.points >= 1000 },
  { id: 'tasks_first', emoji: '✅', title: 'First Step',    desc: 'Complete first task',         check: (s) => (s.todos || []).some(t => t.completed) },
];

const initialFocusData = () => {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      hours: 0,
    });
  }
  return days;
};

// Default Initial 4-Level Course Hierarchy (Course -> Subject -> Chapter -> Topic -> Sub-topic)
const DEFAULT_COURSES = [
  {
    id: 'course_gate_cs',
    title: 'GATE CSE & IT 2026',
    category: 'Engineering',
    icon: '💻',
    subjects: [
      {
        id: 'sub_dsa',
        title: 'Data Structures & Algorithms',
        icon: '🌳',
        chapters: [
          {
            id: 'chap_trees',
            title: 'Trees & Heaps',
            topics: [
              {
                id: 'top_bst',
                title: 'Binary Search Trees & Balancing',
                subTopics: [
                  { id: 'st_bst_1', title: 'BST Insertion & Deletion Properties', completed: true },
                  { id: 'st_bst_2', title: 'AVL Tree Single & Double Rotations', completed: false },
                  { id: 'st_bst_3', title: 'Red-Black Tree Black Height Invariant', completed: false }
                ]
              },
              {
                id: 'top_heaps',
                title: 'Heap Data Structures & Priority Queues',
                subTopics: [
                  { id: 'st_heap_1', title: 'Min-Heapify & Max-Heapify Operations', completed: true },
                  { id: 'st_heap_2', title: 'Build-Heap O(N) Time Proof', completed: false }
                ]
              }
            ]
          },
          {
            id: 'chap_graphs',
            title: 'Graph Algorithms',
            topics: [
              {
                id: 'top_traversals',
                title: 'BFS & DFS Applications',
                subTopics: [
                  { id: 'st_g_1', title: 'Cycle Detection in Directed & Undirected Graphs', completed: true },
                  { id: 'st_g_2', title: 'Dijkstra & Bellman-Ford Shortest Paths', completed: false }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sub_os',
        title: 'Operating Systems',
        icon: '⚡',
        chapters: [
          {
            id: 'chap_sync',
            title: 'Process Synchronization & Deadlocks',
            topics: [
              {
                id: 'top_deadlocks',
                title: 'Deadlock Prevention & Banker Algorithm',
                subTopics: [
                  { id: 'st_os_1', title: 'Four Necessary Conditions for Deadlock', completed: true },
                  { id: 'st_os_2', title: 'Banker Safety State Checking Algorithm', completed: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course_eng_maths',
    title: 'Engineering Mathematics',
    category: 'Mathematics',
    icon: '📐',
    subjects: [
      {
        id: 'sub_la',
        title: 'Linear Algebra',
        icon: '📊',
        chapters: [
          {
            id: 'chap_matrices',
            title: 'Matrix Theory & Linear Systems',
            topics: [
              {
                id: 'top_eigen',
                title: 'Eigenvalues & Eigenvectors',
                subTopics: [
                  { id: 'st_la_1', title: 'Characteristic Equation & Trace/Det Theorem', completed: true },
                  { id: 'st_la_2', title: 'Cayley-Hamilton Theorem Applications', completed: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

const DEFAULT_TODOS = [
  { id: 't_1', title: 'Solve 15 GATE PYQs on Binary Search Trees', completed: false, priority: 'high', category: 'Study' },
  { id: 't_2', title: 'Complete 45-minute Deep Focus Session', completed: true, priority: 'medium', category: 'Focus' },
  { id: 't_3', title: 'Review Operating Systems Synchronization Notes', completed: false, priority: 'normal', category: 'Revision' },
];

const DEFAULT_INITIAL_GOALS = [
  {
    id: 'c_gate_master',
    title: 'GATE 2026 Ranker',
    emoji: '🎓',
    description: 'Master engineering math, PYQs, and technical concepts daily.',
    totalDays: 90,
    completedDays: 1,
    milestones: [
      { id: 'm_gate_1', title: 'GATE Maths & General Aptitude Drills', time: '7:00 AM', duration: '60 min', completed: false, points: 50 },
      { id: 'm_gate_2', title: 'Core Technical Subject Deep Study', time: '9:30 AM', duration: '90 min', completed: false, points: 90 },
      { id: 'm_gate_3', title: 'Solve 20 Previous Year Questions (PYQs)', time: '2:00 PM', duration: '60 min', completed: false, points: 60 },
      { id: 'm_gate_4', title: 'Formula Revision & Mock Error Review', time: '8:30 PM', duration: '45 min', completed: false, points: 40 },
    ],
  },
  {
    id: 'c_deep_work',
    title: 'Deep Work Mastery',
    emoji: '🧠',
    description: 'Build an unbreakable focus habit over 60 days.',
    totalDays: 60,
    completedDays: 1,
    milestones: [
      { id: 'm_dw_1', title: 'Morning pages (10 min journaling)', time: '7:00 AM', duration: '10 min', completed: false, points: 15 },
      { id: 'm_dw_2', title: 'Deep work block #1 (no distractions)', time: '9:00 AM', duration: '90 min', completed: false, points: 90 },
      { id: 'm_dw_3', title: 'Learning session (read/course)', time: '2:00 PM', duration: '45 min', completed: false, points: 45 },
    ],
  }
];

// ─── Main Store ───────────────────────────────────────────────────────────────
const useStore = create(
  persist(
    (set, get) => ({
      // === User Profile & Auth ===
      authLoading: true,
      authInitialized: false,
      isAuthenticated: false,
      userId: null,
      userEmail: null,
      userName: '',
      userAvatar: '⚡',
      userBio: '',
      joinedDate: new Date().toISOString(),
      totalFocusMinutes: 0,
      perfectFocusSessions: 0,
      totalTasksCompleted: 0,
      unlockedAchievements: [],

      // Initialize Firebase Auth Realtime Listener
      initAuthListener: () => {
        if (get().authInitialized) return;
        set({ authInitialized: true });

        onAuthStateChanged(auth, (user) => {
          if (user) {
            const displayName = user.displayName || user.email?.split('@')[0] || 'Scholar';
            set({
              isAuthenticated: true,
              authLoading: false,
              userId: user.uid,
              userEmail: user.email,
              userName: displayName,
              userAvatar: user.photoURL || '⚡',
            });
          } else {
            const currentUserId = get().userId;
            if (currentUserId && !currentUserId.startsWith('guest_')) {
              set({
                isAuthenticated: false,
                authLoading: false,
                userId: null,
                userEmail: null,
              });
            } else {
              set({ authLoading: false });
            }
          }
        });
      },

      logoutUser: async () => {
        try {
          await firebaseSignOut(auth);
        } catch (e) {
          console.warn('[FLUX Auth] Firebase SignOut notice:', e);
        }
        set({
          isAuthenticated: false,
          userId: null,
          userEmail: null,
        });
      },

      // === Gamification & Streak ===
      streak: 0,
      points: 0,
      streakFreezeTokens: 2,
      isRestMode: false,
      lastActiveDate: new Date().toISOString().split('T')[0],

      activateStreakFreeze: () => {
        const state = get();
        if (state.streakFreezeTokens <= 0) return false;

        set((s) => ({
          streakFreezeTokens: s.streakFreezeTokens - 1,
          isRestMode: true,
        }));
        writeData('users', 'gamification', { streakFreezeTokens: get().streakFreezeTokens, isRestMode: true });
        return true;
      },

      // === Derived Helpers ===
      getLevel: () => getLevel(get().points),
      getLevelName: () => getLevelName(get().points),
      getNextLevelPoints: () => getNextLevelPoints(get().points),
      getCurrentLevelPoints: () => getCurrentLevelPoints(get().points),
      getLevelProgress: () => {
        const p = get().points;
        const cur = getCurrentLevelPoints(p);
        const next = getNextLevelPoints(p);
        return Math.min(100, Math.round(((p - cur) / (next - cur)) * 100));
      },

      // === Focus Sessions ===
      focusSessions: initialFocusData(),
      currentSessionDistractions: 0,

      // === Active Multi-Goal System ===
      activeChallenges: DEFAULT_INITIAL_GOALS,
      selectedChallengeId: 'c_gate_master',

      getActiveMilestones: () => {
        const state = get();
        const cur = state.activeChallenges.find((c) => c.id === state.selectedChallengeId) || state.activeChallenges[0];
        return cur ? (cur.milestones || []) : [];
      },

      // === 4-Level Course Hierarchy State ===
      courses: DEFAULT_COURSES,

      // Course Actions
      addCourse: (title, category = 'General', icon = '📚') => {
        const newCourse = { id: `c_${Date.now()}`, title: title.trim(), category, icon, subjects: [] };
        set((s) => ({ courses: [...s.courses, newCourse] }));
        writeData('users', 'courses', { courses: get().courses });
      },
      editCourse: (courseId, updates) => {
        set((s) => ({
          courses: s.courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c)),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },
      deleteCourse: (courseId) => {
        set((s) => ({ courses: s.courses.filter((c) => c.id !== courseId) }));
        writeData('users', 'courses', { courses: get().courses });
      },

      // Subject Actions
      addSubject: (courseId, title, icon = '📘') => {
        const newSub = { id: `sub_${Date.now()}`, title: title.trim(), icon, chapters: [] };
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? { ...c, subjects: [...(c.subjects || []), newSub] } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },
      editSubject: (courseId, subjectId, updates) => {
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? { ...sub, ...updates } : sub),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },
      deleteSubject: (courseId, subjectId) => {
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).filter((sub) => sub.id !== subjectId),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },

      // Chapter Actions
      addChapter: (courseId, subjectId, title) => {
        const newChap = { id: `chap_${Date.now()}`, title: title.trim(), topics: [] };
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? {
              ...sub,
              chapters: [...(sub.chapters || []), newChap],
            } : sub),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },
      editChapter: (courseId, subjectId, chapterId, updates) => {
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? {
              ...sub,
              chapters: (sub.chapters || []).map((ch) => ch.id === chapterId ? { ...ch, ...updates } : ch),
            } : sub),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },
      deleteChapter: (courseId, subjectId, chapterId) => {
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? {
              ...sub,
              chapters: (sub.chapters || []).filter((ch) => ch.id !== chapterId),
            } : sub),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },

      // Topic Actions
      addTopic: (courseId, subjectId, chapterId, title) => {
        const newTop = { id: `top_${Date.now()}`, title: title.trim(), subTopics: [] };
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? {
              ...sub,
              chapters: (sub.chapters || []).map((ch) => ch.id === chapterId ? {
                ...ch,
                topics: [...(ch.topics || []), newTop],
              } : ch),
            } : sub),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },
      editTopic: (courseId, subjectId, chapterId, topicId, updates) => {
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? {
              ...sub,
              chapters: (sub.chapters || []).map((ch) => ch.id === chapterId ? {
                ...ch,
                topics: (ch.topics || []).map((tp) => tp.id === topicId ? { ...tp, ...updates } : tp),
              } : ch),
            } : sub),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },
      deleteTopic: (courseId, subjectId, chapterId, topicId) => {
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? {
              ...sub,
              chapters: (sub.chapters || []).map((ch) => ch.id === chapterId ? {
                ...ch,
                topics: (ch.topics || []).filter((tp) => tp.id !== topicId),
              } : ch),
            } : sub),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },

      // Sub-topic Actions
      addSubTopic: (courseId, subjectId, chapterId, topicId, title) => {
        const newSubTop = { id: `st_${Date.now()}`, title: title.trim(), completed: false };
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? {
              ...sub,
              chapters: (sub.chapters || []).map((ch) => ch.id === chapterId ? {
                ...ch,
                topics: (ch.topics || []).map((tp) => tp.id === topicId ? {
                  ...tp,
                  subTopics: [...(tp.subTopics || []), newSubTop],
                } : tp),
              } : ch),
            } : sub),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },
      editSubTopic: (courseId, subjectId, chapterId, topicId, subTopicId, updates) => {
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? {
              ...sub,
              chapters: (sub.chapters || []).map((ch) => ch.id === chapterId ? {
                ...ch,
                topics: (ch.topics || []).map((tp) => tp.id === topicId ? {
                  ...tp,
                  subTopics: (tp.subTopics || []).map((st) => st.id === subTopicId ? { ...st, ...updates } : st),
                } : tp),
              } : ch),
            } : sub),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },
      deleteSubTopic: (courseId, subjectId, chapterId, topicId, subTopicId) => {
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? {
              ...sub,
              chapters: (sub.chapters || []).map((ch) => ch.id === chapterId ? {
                ...ch,
                topics: (ch.topics || []).map((tp) => tp.id === topicId ? {
                  ...tp,
                  subTopics: (tp.subTopics || []).filter((st) => st.id !== subTopicId),
                } : tp),
              } : ch),
            } : sub),
          } : c),
        }));
        writeData('users', 'courses', { courses: get().courses });
      },
      toggleSubTopicComplete: (courseId, subjectId, chapterId, topicId, subTopicId) => {
        let earned = false;
        set((s) => ({
          courses: s.courses.map((c) => c.id === courseId ? {
            ...c,
            subjects: (c.subjects || []).map((sub) => sub.id === subjectId ? {
              ...sub,
              chapters: (sub.chapters || []).map((ch) => ch.id === chapterId ? {
                ...ch,
                topics: (ch.topics || []).map((tp) => tp.id === topicId ? {
                  ...tp,
                  subTopics: (tp.subTopics || []).map((st) => {
                    if (st.id === subTopicId) {
                      const next = !st.completed;
                      if (next) earned = true;
                      return { ...st, completed: next };
                    }
                    return st;
                  }),
                } : tp),
              } : ch),
            } : sub),
          } : c),
        }));
        if (earned) {
          get().addPoints(15);
        }
        writeData('users', 'courses', { courses: get().courses });
      },

      // === Todo System State & Actions ===
      todos: DEFAULT_TODOS,

      addTodo: (title, priority = 'medium', category = 'General') => {
        const newTodo = { id: `todo_${Date.now()}`, title: title.trim(), completed: false, priority, category };
        set((s) => ({ todos: [newTodo, ...s.todos] }));
        writeData('users', 'todos', { todos: get().todos });
      },
      editTodo: (todoId, updates) => {
        set((s) => ({ todos: s.todos.map((t) => (t.id === todoId ? { ...t, ...updates } : t)) }));
        writeData('users', 'todos', { todos: get().todos });
      },
      deleteTodo: (todoId) => {
        set((s) => ({ todos: s.todos.filter((t) => t.id !== todoId) }));
        writeData('users', 'todos', { todos: get().todos });
      },
      toggleTodo: (todoId) => {
        let earned = false;
        set((s) => ({
          todos: s.todos.map((t) => {
            if (t.id === todoId) {
              const next = !t.completed;
              if (next) earned = true;
              return { ...t, completed: next };
            }
            return t;
          }),
        }));
        if (earned) {
          get().addPoints(10);
        }
        writeData('users', 'todos', { todos: get().todos });
      },

      // === Journal & Tribe ===
      journalEntries: [],
      joinedChallenges: [],
      leaderboard: [
        { id: 'u1', name: 'ZenMaster_K',    streak: 84, level: 9, avatar: '🧘' },
        { id: 'u2', name: 'FlowState_Dev',   streak: 61, level: 8, avatar: '💻' },
        { id: 'u3', name: 'IronMind_J',      streak: 55, level: 7, avatar: '🔥' },
        { id: 'u4', name: 'DeepWork_Pro',    streak: 48, level: 7, avatar: '⚡' },
        { id: 'u5', name: 'FocusFuture',     streak: 42, level: 6, avatar: '🚀' },
      ],

      // ─── Actions ────────────────────────────────────────────────────────────

      updateProfile: (updates) => {
        const sanitized = { ...updates };
        if (typeof sanitized.userName === 'string') sanitized.userName = sanitized.userName.slice(0, 50);
        if (typeof sanitized.userBio === 'string') sanitized.userBio = sanitized.userBio.slice(0, 150);
        if (typeof sanitized.userAvatar === 'string') sanitized.userAvatar = sanitized.userAvatar.slice(0, 8);
        set(sanitized);
        writeData('users', 'profile', { ...get(), ...sanitized, _type: 'profile' });
      },

      addPoints: (amount) => {
        set((state) => {
          const newPoints = state.points + amount;
          const today = new Date().toISOString().split('T')[0];
          return { points: newPoints, lastActiveDate: today };
        });
        get().checkAchievements();
        writeData('users', 'gamification', { points: get().points, streak: get().streak });
      },

      checkAchievements: () => {
        const state = get();
        const newUnlocks = [];
        for (const ach of ACHIEVEMENTS) {
          if (!state.unlockedAchievements.includes(ach.id) && ach.check(state)) {
            newUnlocks.push(ach.id);
          }
        }
        if (newUnlocks.length > 0) {
          set((s) => ({ unlockedAchievements: [...s.unlockedAchievements, ...newUnlocks] }));
        }
        return newUnlocks;
      },

      addChallenge: (newChallenge, initialMilestones = []) => {
        const challengeObj = {
          id: `c_${Date.now()}`,
          totalDays: 60,
          completedDays: 1,
          ...newChallenge,
          milestones: (initialMilestones || []).slice(0, 30),
        };
        set((state) => ({
          activeChallenges: [challengeObj, ...state.activeChallenges].slice(0, 20),
          selectedChallengeId: challengeObj.id,
        }));
        writeData('users', 'challenges', { challenges: get().activeChallenges });
      },

      selectChallenge: (challengeId) => {
        set({ selectedChallengeId: challengeId });
      },

      deleteChallenge: (challengeId) => {
        set((state) => {
          const updatedChallenges = state.activeChallenges.filter((c) => c.id !== challengeId);
          const nextSelected = updatedChallenges.length > 0 ? updatedChallenges[0].id : null;
          return {
            activeChallenges: updatedChallenges,
            selectedChallengeId: nextSelected,
          };
        });
        writeData('users', 'challenges', { challenges: get().activeChallenges });
      },

      addMilestone: (milestone) => {
        const newMilestone = {
          id: `milestone_${Date.now()}`,
          completed: false,
          points: 30,
          time: '12:00 PM',
          duration: '30 min',
          ...milestone,
        };

        set((state) => {
          const updatedChallenges = state.activeChallenges.map((c) => {
            if (c.id === state.selectedChallengeId) {
              const currentMilestones = c.milestones || [];
              const updated = currentMilestones.length >= 30 
                ? [...currentMilestones.slice(-29), newMilestone] 
                : [...currentMilestones, newMilestone];
              return {
                ...c,
                milestones: updated,
              };
            }
            return c;
          });

          return { activeChallenges: updatedChallenges };
        });

        writeData('users', 'challenges', { challenges: get().activeChallenges });
      },

      deleteMilestone: (milestoneId) => {
        set((state) => {
          const updatedChallenges = state.activeChallenges.map((c) => {
            if (c.id === state.selectedChallengeId) {
              return {
                ...c,
                milestones: (c.milestones || []).filter((m) => m.id !== milestoneId),
              };
            }
            return c;
          });

          return { activeChallenges: updatedChallenges };
        });

        writeData('users', 'challenges', { challenges: get().activeChallenges });
      },

      completeRoadmapTask: (taskId) => {
        const state = get();
        const currentGoal = state.activeChallenges.find((c) => c.id === state.selectedChallengeId);
        if (!currentGoal) return;

        const milestone = (currentGoal.milestones || []).find((m) => m.id === taskId);
        if (!milestone || milestone.completed) return;

        set((s) => {
          const updatedChallenges = s.activeChallenges.map((c) => {
            if (c.id === s.selectedChallengeId) {
              return {
                ...c,
                milestones: (c.milestones || []).map((m) =>
                  m.id === taskId ? { ...m, completed: true } : m
                ),
              };
            }
            return c;
          });

          return {
            activeChallenges: updatedChallenges,
            totalTasksCompleted: s.totalTasksCompleted + 1,
          };
        });

        get().addPoints(milestone.points || 30);
        writeData('users', 'challenges', { challenges: get().activeChallenges });
      },

      addFocusSession: (minutesFocused, distractions) => {
        const today = new Date().toISOString().split('T')[0];
        const isPerfect = distractions === 0;
        set((state) => {
          const existing = state.focusSessions.findIndex((s) => s.date === today);
          const hoursToAdd = minutesFocused / 60;
          let updated = [...state.focusSessions];
          if (existing !== -1) {
            updated[existing] = { ...updated[existing], hours: parseFloat((updated[existing].hours + hoursToAdd).toFixed(2)) };
          } else {
            updated = [...updated, { date: today, hours: parseFloat(hoursToAdd.toFixed(2)) }];
          }
          const boundedSessions = updated.slice(-365);
          return {
            focusSessions: boundedSessions,
            streak: state.streak + 1,
            totalFocusMinutes: state.totalFocusMinutes + minutesFocused,
            perfectFocusSessions: isPerfect ? state.perfectFocusSessions + 1 : state.perfectFocusSessions,
            currentSessionDistractions: 0,
          };
        });
        get().addPoints(minutesFocused);
        writeData('users', 'focus', { sessions: get().focusSessions, totalFocusMinutes: get().totalFocusMinutes });
      },

      incrementDistraction: () => set((s) => ({ currentSessionDistractions: s.currentSessionDistractions + 1 })),
      resetDistraction: () => set({ currentSessionDistractions: 0 }),

      addJournalEntry: (text, rating, aiInsight = null) => {
        const entry = { id: `j_${Date.now()}`, date: new Date().toISOString(), text, rating, aiInsight };
        set((state) => ({ journalEntries: [entry, ...state.journalEntries] }));
        get().addPoints(20 + rating * 5);
        writeData('users', 'journal', { entries: get().journalEntries });
      },

      editJournalEntry: (entryId, newText, newRating) => {
        set((state) => ({
          journalEntries: state.journalEntries.map((e) =>
            e.id === entryId ? { ...e, text: newText, rating: newRating } : e
          ),
        }));
        writeData('users', 'journal', { entries: get().journalEntries });
      },

      deleteJournalEntry: (entryId) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter((e) => e.id !== entryId),
        }));
        writeData('users', 'journal', { entries: get().journalEntries });
      },

      joinChallenge: (challengeId) => {
        set((state) => ({
          joinedChallenges: state.joinedChallenges.includes(challengeId)
            ? state.joinedChallenges
            : [...state.joinedChallenges, challengeId],
        }));
      },

      clearAllData: () => {
        ['flux-storage-v5', 'flux-sync-queue', 'flux-onboarding-done', 'flux-ai-cache', 'flux-ai-rates'].forEach((k) => {
          localStorage.removeItem(k);
        });
        window.location.reload();
      },
    }),
    {
      name: 'flux-storage-v5',
      partialize: (state) => ({
        userName: state.userName,
        userAvatar: state.userAvatar,
        userBio: state.userBio,
        joinedDate: state.joinedDate,
        totalFocusMinutes: state.totalFocusMinutes,
        perfectFocusSessions: state.perfectFocusSessions,
        totalTasksCompleted: state.totalTasksCompleted,
        unlockedAchievements: state.unlockedAchievements,
        streak: state.streak,
        points: state.points,
        lastActiveDate: state.lastActiveDate,
        focusSessions: state.focusSessions,
        activeChallenges: state.activeChallenges,
        selectedChallengeId: state.selectedChallengeId,
        journalEntries: state.journalEntries,
        joinedChallenges: state.joinedChallenges,
        currentSessionDistractions: state.currentSessionDistractions,
        courses: state.courses,
        todos: state.todos,
      }),
    }
  )
);

export default useStore;
