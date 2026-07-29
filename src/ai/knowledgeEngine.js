// FLUX AI Coach Offline Knowledge Memory Engine (RAG & Local Intent Matcher)

const KNOWLEDGE_BASE = [
  // 1. GATE & CS CORE
  {
    topic: 'dsa',
    keywords: ['dsa', 'data structure', 'algorithm', 'binary tree', 'graph', 'dp', 'dynamic programming', 'sorting', 'leetcode', 'array'],
    answers: [
      "Master the fundamental patterns first: Two Pointers, Sliding Window, Fast/Slow Pointers, and BFS/DFS. For DP, write down the recursive state transition before optimizing space.",
      "For GATE/Technical interviews, focus on Time & Space complexity analysis. Always verify edge cases: empty inputs, single element, negative numbers, and integer overflow.",
      "When tackling graph problems, remember: BFS guarantees the shortest path on unweighted graphs, while Dijkstra handles non-negative edge weights."
    ]
  },
  {
    topic: 'dbms',
    keywords: ['dbms', 'sql', 'database', 'normalization', 'acid', 'transaction', 'b tree', 'join', 'indexing'],
    answers: [
      "BCNF requires every determinant to be a candidate key. If A -> B holds, A MUST be a superkey. Eliminating redundancy prevents insertion, deletion, and update anomalies.",
      "ACID breakdown: Atomicity (All or nothing via undo logs), Consistency (Valid state), Isolation (Locking/MVCC), Durability (Redo logs).",
      "B+ Trees keep data pointers only at leaf nodes, keeping internal nodes small. This maximizes fan-out and dramatically reduces disk I/O seek operations."
    ]
  },
  {
    topic: 'os',
    keywords: ['os', 'operating system', 'process', 'thread', 'deadlock', 'semaphore', 'paging', 'virtual memory'],
    answers: [
      "Four necessary conditions for Deadlock: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, 4) Circular Wait. Break any one condition to prevent deadlocks.",
      "Virtual memory translates logical addresses to physical addresses using Page Tables and TLB. A TLB hit saves memory lookup access time.",
      "Process context switching saves CPU registers, Program Counter, and stack pointers to the PCB. Thread switching within the same process is faster as memory space is shared."
    ]
  },

  // 2. TECH INTERVIEW & SYSTEM DESIGN
  {
    topic: 'interview',
    keywords: ['interview', 'system design', 'resume', 'hiring', 'behavioral', 'star method', 'mock interview', 'faang'],
    answers: [
      "In System Design interviews, follow the 4-step framework: 1) Clarify scope/requirements, 2) Estimate scale (QPS, Storage), 3) Define High-Level API & Data Model, 4) Deep dive into bottlenecks.",
      "Structure behavioral answers using the STAR method (Situation, Task, Action, Result). Quantify your impact with metrics (e.g. 'Improved API latency by 42%').",
      "Before writing a line of code in technical rounds, talk through your thought process with the interviewer. Confirm edge cases and complexity expectations upfront."
    ]
  },

  // 3. COMPETITIVE EXAMS (GATE, JEE, NEET, UPSC)
  {
    topic: 'exam_prep',
    keywords: ['gate', 'jee', 'neet', 'upsc', 'revision', 'pyq', 'mock test', 'marks', 'rank', 'syllabus', 'exam'],
    answers: [
      "The key to competitive exams isn't just studying — it's Mock Test Error Logs. Maintain an Error Notebook categorizing mistakes into: Conceptual, Calculation, or Misreading.",
      "Prioritize Previous Year Questions (PYQs) from the last 15 years. Treat every PYQ option as a conceptual topic to master.",
      "Implement the 3-Pass Exam Strategy: Pass 1 (Easy/Instant Qs), Pass 2 (Medium calculation Qs), Pass 3 (Challenging/Time-consuming Qs)."
    ]
  },

  // 4. PRODUCTIVITY & MINDSET
  {
    topic: 'productivity',
    keywords: ['focus', 'distraction', 'procrastin', 'habit', 'streak', 'routine', 'pomodoro', 'atomic habits', 'burnout', 'motivation'],
    answers: [
      "Action precedes motivation. Use James Clear's 2-Minute Rule: commit to starting for just 120 seconds. Once momentum starts, focus flows naturally.",
      "Protect your peak cognitive window (usually early morning). Reserve it for deep, unstructured problem solving — no phone, no notifications, pure flow.",
      "Remember Marcus Aurelius: 'You have power over your mind - not outside events. Realize this, and you will find strength.' Ignore what you cannot control."
    ]
  }
];

const FALLBACK_INSIGHTS = [
  "Stay focused on your primary objective. Every focused minute compounds your self-discipline over time.",
  "Great question. Break down this task into micro-steps, complete the first step in 5 minutes, and build momentum.",
  "Consistency is what converts average effort into elite mastery. Keep executing your daily protocol.",
  "Trust the system. Small daily gains compound into massive breakthroughs over a 90-day window."
];

export function searchLocalKnowledge(userQuery) {
  if (!userQuery) return null;
  const q = String(userQuery).toLowerCase().trim();

  for (const entry of KNOWLEDGE_BASE) {
    for (const kw of entry.keywords) {
      if (q.includes(kw)) {
        // Return a randomized matching answer from knowledge base
        const answers = entry.answers;
        const selected = answers[Math.floor(Math.random() * answers.length)];
        return `⚡ [FLUX Local Knowledge]: ${selected}`;
      }
    }
  }

  return null;
}

export function getOfflineAIResponse(userQuery) {
  const localMatch = searchLocalKnowledge(userQuery);
  if (localMatch) return localMatch;

  // Varied fallback insight so it never repeats the exact same single phrase
  const idx = Math.floor(Math.random() * FALLBACK_INSIGHTS.length);
  return `⚡ [FLUX Coach]: ${FALLBACK_INSIGHTS[idx]}`;
}
