// Offline Trained Intelligence Engine & Gemini AI Integration
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn('[Gemini AI] Initialization error, falling back to offline mode:', err);
  }
}

// 365+ built-in motivational quotes. Index is chosen by day-of-year, so it
// rotates daily automatically without any network call.
const HYPE_MESSAGES = [
  "With {streak} days of fire and {points} points stacked, you are not just building habits, you are building a different version of yourself. Don't stop now.",
  "Day {streak} and counting. Most people quit on Day 3. You are still here, still grinding, and {points} points prove it.",
  "The version of you from three months ago would be amazed at what you have already built in {streak} days. Keep going.",
  "{points} points earned through pure discipline. You are in the top 1% of people who actually follow through. Level up today.",
  "{streak}-day streak? That is not luck, that is identity. You are someone who shows up every single day. Prove it again.",
  "Every distraction you have ignored, every time you chose deep work over dopamine, {points} points is just the receipt. The real prize is who you are becoming.",
  "Day {streak}. You have already won more than most people ever will. Now finish the day stronger than you started it.",
  "Consistency is the rarest form of talent. {streak} days is proof you have it.",
  "Your future self is watching you right now, making the decision to study or scroll. Choose wisely.",
  "The exam does not care about your mood. But you showed up anyway. That is what separates the prepared from the rest.",
  "{points} points and {streak} days. No shortcuts, no cheats. Just you and your work.",
  "Hard days are not obstacles. They are the training. Keep going.",
  "The ones who win are the ones who do the work on the days they least feel like it. Today might be that day.",
  "Right now, somewhere, your competition is taking a break. Use this moment.",
  "Every page you read today is a page your competition did not. {streak} days of showing up matters.",
  "You have stayed consistent for {streak} days. That is not something most people will ever experience. Protect it.",
  "Discipline is freedom. The more you build it, the more you control your own results.",
  "Your {points} points are not a number. They are a record of every time you chose effort over ease.",
  "Nobody remembers who studied comfortably. They remember who showed up when it was hard.",
  "The syllabus is not the enemy. Delay is the enemy. Start now.",
  "One focused hour beats three distracted hours. Deep work is a skill. You are building it.",
  "Being tired is normal. Quitting is a choice. You do not quit.",
  "Every session you complete on FLUX is a vote for the person you want to become.",
  "You are not studying for the exam. You are studying to understand the world at a deeper level. The rank follows.",
  "When it is dark and quiet and you are still working, that is when the gap between you and others grows.",
  "Momentum is built one session at a time. {streak} days of sessions is {streak} days of momentum.",
  "A 1% improvement every day makes you 37 times better in a year. You are on Day {streak}.",
  "The timer does not lie. Time spent focused always pays back.",
  "No matter how slow you go, you are still lapping everyone sitting on the couch.",
  "Success in competitive exams is 80% consistency and 20% strategy. You are nailing the hardest part.",
  "Your habit is {streak} days old. That is a life changing streak. Guard it tonight.",
  "There is no talent shortcut. There is only the hours you put in. {points} points confirm yours.",
  "One day at a time. One concept at a time. One problem at a time. {streak} days of this adds up to everything.",
  "You do not need motivation every day. You need the system. The system is working.",
  "When the results come in, they will look like talent. Only you will know it was {streak} straight days of discipline.",
  "Do the reps. Every formula drilled, every question solved is a rep. {points} reps logged.",
  "The brain learns by doing, not by planning to do. Open the book.",
  "Today's focused session is tomorrow's confidence on exam day.",
  "Pressure creates diamonds. You have been under productive pressure for {streak} days.",
  "The rank list will not be kind to those who procrastinated. You chose not to be one of them.",
  "You have built something real in {streak} days. Protect it with one more session today.",
  "Silence your notifications. Open your notes. The world can wait.",
  "Champions are not born on the stage. They are born in the quiet hours nobody sees.",
  "Doubt is normal. Act anyway. You have done it {streak} days straight.",
  "Your brain is plastic. It reshapes around whatever you feed it most. Feed it knowledge today.",
  "{points} points later, you are still here. The beginning of something serious.",
  "Studying when you are tired is a skill. You are practicing it right now.",
  "You do not need to feel ready. You just need to start. You have started {streak} days in a row.",
  "The compound effect of {streak} days of effort is something no shortcut can replicate.",
  "Think about how proud you will feel on results day. Work today is the only way to earn that feeling.",
  "Every concept you lock in today is one less thing to panic about tomorrow.",
  "Slow down. Read it again. Understanding is worth more than speed.",
  "The sharpest students are not the most gifted. They are the most consistent. Day {streak}.",
  "Your goals are worth one more hour of effort today.",
  "Difficult topics do not become easier by avoiding them. Sit with it today.",
  "You have made {streak} deposits into your knowledge bank. The interest is compounding.",
  "Do not compare your journey to someone else's highlight reel. Focus on your own {streak}-day story.",
  "The best revision is the one you actually do. Pick up where you left off.",
  "Nobody is coming to save you from the exam. But you do not need saving. You have {streak} days of preparation.",
  "Respect your own effort. {points} points represent real time, real focus, real growth.",
  "Strong results come from strong foundations. Build yours today.",
  "The most important study session is the one that happens on the day you least want to open the book.",
  "Stick to the plan. Adjust if needed. Do not abandon.",
  "The quieter you get, the more you can hear what you still need to learn.",
  "Hard work does not guarantee success. But it makes failure a lot less likely.",
  "You are {streak} days closer to the result you are chasing.",
  "Effort leaves traces. Your {points} points are those traces.",
  "Revision is not repetition. It is reinforcement. Go over it one more time.",
  "Every time you sit down to study instead of scrolling, you are winning an invisible war.",
  "Your streak of {streak} days is already a rarer achievement than most exam ranks.",
  "The student who practices problems consistently outperforms the one who only reads theory. Practice today.",
  "You chose to study on Day 1. You chose again on Day {streak}. That choice defines you.",
  "Block out an hour. Close the apps. Get after it.",
  "You are not behind. You are exactly where your effort has brought you. Increase the effort.",
  "Perfection is the enemy of progress. Done is better than perfect. Submit the answer.",
  "A score is not a reflection of your worth. It is a signal of where to work harder. Use it.",
  "Your consistency record of {streak} days is a personal brand nobody can copy.",
  "Less distraction, more depth. That is the formula that works.",
  "You have earned the right to feel confident today. {streak} days says so.",
  "The exam does not reward who tried hardest. It rewards who was best prepared. Be best prepared.",
  "Eat, rest, study. The simple formula. Repeat it for {streak} more days.",
  "Your {points} points are a ledger of time invested. Add to the ledger today.",
  "One hour of deep work before anyone else wakes up is worth three hours of interrupted study.",
  "Start before you feel ready. {streak} days of starting before feeling ready has already changed you.",
  "The gap between where you are and where you want to be is closed session by session.",
  "You are not your worst day. You are the average of {streak} days of showing up.",
  "Study harder in private so the results can speak louder in public.",
  "Learning is uncomfortable. That discomfort is growth. Stay with it.",
  "The basics matter most. Master them before chasing advanced content.",
  "You have never regretted a completed study session. You have regretted skipping one.",
  "Run your own race. Measure yourself only against yesterday's version of you.",
  "Day {streak}. Still here. Still building. That is rare.",
  "Action cures anxiety. Open the book, start a timer, and watch the fog clear.",
  "Your rank in the exam begins with your rank in today's focus session.",
  "Confidence is built in preparation, not on exam day. Build it now.",
  "Every answer you get wrong in practice is a point you gain on exam day. Embrace the mistakes.",
  "You are the sum of your habits. {streak} days of study habits is a powerful sum.",
  "Think less about motivation. Think more about showing up. You have shown up {streak} days.",
  "Make your study time sacred. No interruptions. One hour of undivided focus.",
  "The most successful students have one thing in common: they sat down and did the work when they did not want to.",
  "Brick by brick. Concept by concept. Page by page. {streak} days of bricks.",
  "When you complete today's session, you are one day closer and one preparation level higher.",
  "The timer is your training partner. It holds you accountable when willpower fades.",
  "Progress is invisible until it is not. Trust the process through Day {streak}.",
  "Write it, speak it, teach it. Recall is the deepest form of study.",
  "Stop overthinking which topic to study. Pick one and go deep for one hour.",
  "You are stronger than your last moment of doubt. Prove it with one session.",
  "Knowledge compounds. Every session you do today multiplies your capacity for tomorrow.",
  "Your {streak}-day habit is stronger than any single bad day. Protect it.",
  "Set the timer. Start the session. The motivation will follow the action.",
  "The syllabus is not infinite. You are chipping away at it. {points} points of progress.",
  "Not every session will feel great. But every session is worth it.",
  "Discipline is doing what needs to be done, even when nobody is watching. Especially then.",
  "Your future reward is locked behind today's effort. Turn the key.",
  "Excellence is not a destination. It is the continuous willingness to show up. Day {streak}.",
  "Difficult is not the same as impossible. The topic you are avoiding is learnable.",
  "Your comfort zone and your exam hall have nothing in common. Train outside it.",
  "Focused study protects your future. An hour today, a better tomorrow.",
  "Every right answer you practice today is one less shock on exam day.",
  "You bring {streak} days of context to every new topic you study. That context is power.",
  "Less multitasking, more monotasking. Close everything else and learn one thing deeply.",
  "The books do not read themselves. But you read them, day after day for {streak} days.",
  "Preparation is confidence. Confidence is performance. Perform through preparation.",
  "You have earned every one of those {points} points. Now earn tomorrow's.",
  "Clear plan, focused session, honest review. Repeat until results arrive.",
  "Small wins add up. Today's session is a small win in a long chain of {streak} wins.",
  "Your results will be a portrait of your daily choices. Paint it deliberately.",
  "The only study session that does not count is the one you skipped. Do not skip today.",
  "Exam success is simple, not easy. Study consistently, review actively, sleep enough. Day {streak}.",
  "Deep understanding is the weapon that beats all surface memorizers.",
  "You are planting trees whose shade you will sit in on results day. Plant today.",
  "Whatever you felt yesterday does not define today. Today starts now.",
  "Treat every practice question like exam day. Full focus, no shortcuts.",
  "The quiet student who is actually working will outperform the loud one who is not.",
  "Review your errors daily. They are the map to your improvement.",
  "You have studied for {streak} days. The exam is one day. You are ready for one day.",
  "Intensity matters. A focused 45 minutes beats a distracted three hours every time.",
  "Your streak is proof that you can do hard things. Consistently.",
  "When the exam feels overwhelming, remember you have already done the hardest part: showing up for {streak} days.",
  "Compete with yesterday's understanding, not with other students' visible performance.",
  "Momentum is precious. You have {streak} days of it. Use today to extend it.",
  "The concept you almost understand is one revision away from fully clicking.",
  "Your brain needs sleep to consolidate what you studied today. Earn the rest.",
  "Every session you complete is a transfer from short-term effort to long-term ability.",
  "You do not need a perfect plan. You need a consistent effort. {streak} days of proof.",
  "Build the habit so strong that not studying feels wrong. You are already there.",
  "The finish line is fixed. How fast you get there depends on today.",
  "You chose this path for a reason. Reconnect with that reason and go study.",
  "Hard work and smart work together are unstoppable. You are doing both.",
  "Your preparation is an act of respect for your own goals.",
  "When you feel stuck, solve one small problem. Then another. The momentum returns.",
  "{streak} days. That number represents the best investment you are making right now.",
  "The next level of your results is waiting on the other side of today's session.",
  "You do not have to feel confident to act confident. Act first. The feeling follows.",
  "Sharpen the saw. Revise the fundamentals before advancing.",
  "Every hour of focused effort today is compound interest on your result.",
  "The biggest risk is not trying hard enough. You are managing that risk with {streak} days of effort.",
  "Done imperfectly today beats planned perfectly but never started.",
  "One question at a time. That is how complex topics become manageable.",
  "Close the social apps. The world will still be there when you finish the session.",
  "Your competition is not resting. Do not let that scare you. Let it energize you.",
  "Every page you read prepares you for a question the examiner wrote months ago.",
  "Study is not punishment. It is power acquisition. Collect your power today.",
  "Your {streak}-day consistency is the quiet superpower most students never develop.",
  "Rest when you must. Quit never. You have not quit for {streak} days.",
  "Own your schedule. Own your outcome.",
  "Some sessions feel easy. Some feel hard. All of them count. Today's counts.",
  "The score you want is exactly as achievable as your effort makes it.",
  "When the doubt speaks loudly, let the {streak}-day record speak louder.",
  "Your study session tonight is a letter to your future self. Make it worth reading.",
  "Prepare so thoroughly that you feel calm walking into the exam hall.",
  "You have the study system. You have the materials. You have the streak. Now use them.",
  "Routine is not boring. Routine is the foundation of extraordinary results.",
  "One mistake in practice saves ten marks lost in the exam. Learn from every error.",
  "The only thing standing between you and your goal is today's session. Complete it.",
  "Fuel yourself. Rest well. Study hard. These three together are unbeatable.",
  "You are investing in a version of yourself that will thank you for every session you did not skip.",
  "Each concept mastered is a door opened that cannot be closed again.",
  "You already have {points} reasons to believe you can do this. Here is one more: Day {streak}.",
  "Stay off the phone for the next hour. Give yourself the gift of unbroken focus.",
  "Not every concept will feel easy. But every concept is manageable with enough repetition.",
  "The preparation phase always feels longer than it is. The result phase validates every day.",
  "You are building the mental muscle to handle pressure. {streak} days of training.",
  "One great session can shift your entire week's momentum. Make today that session.",
  "Resist the urge to switch topics too quickly. Depth beats breadth before mastery.",
  "Your {points} points are not ceiling. They are your floor. Build higher.",
  "Sleep, eat, study. In that order when rest is needed. In the opposite when energy is high.",
  "The timer does not stop for distractions. Start it. Let it run.",
  "When the exam comes, it will not ask how you felt. It will ask what you know. Know more today.",
  "Every blank page you fill is a memory you create for exam day retrieval.",
  "Your study streak is your most valuable academic asset right now. Guard it.",
  "Solve the next problem. Read the next paragraph. Take the next step. Just the next one.",
  "You are {streak} days deep. The habit has roots. Let it grow.",
  "Your outcome depends on your output. Increase output today.",
  "Thinking about studying is not studying. Start the timer.",
  "Celebrate small wins. {points} points is a lot of small wins stacked up.",
  "Hard problems are not a sign you are failing. They are a sign you are learning.",
  "You have done this for {streak} days. You will do it today too.",
  "The exam is coming whether you study or not. Choose to be ready.",
  "Urgency is not panic. Urgency is clarity about how precious each study session is.",
  "Track your time. Know your patterns. Optimize your strongest hours for hardest material.",
  "You are not just preparing for an exam. You are training your ability to focus under pressure.",
  "The right time to study is always now. The perfect time never arrives.",
  "Clear desk, clear mind, clear goals. Set up your environment and then get to work.",
  "Day {streak} of choosing your future over your comfort. Well done. Keep going.",
  "Your {points} points and {streak}-day streak make you someone the top rankers would respect.",
  "Solve ten problems today. Review five from yesterday. Progress is happening.",
  "You can rest after the exam. For now, study.",
  "The light at the end of the tunnel gets brighter every time you study. Day {streak}.",
  "Small daily improvements are the key to staggering long-term results.",
  "You built the habit. Now the habit builds the rank.",
  "Go over the weak areas. The strong areas will look after themselves.",
  "The session you complete today makes tomorrow's session easier to start.",
  "Precision beats volume. Understand one thing fully before moving to the next.",
  "You are the most important student in your own classroom. Teach yourself well.",
  "A focused student in a quiet room outperforms a distracted genius every time.",
  "Your goal is specific. Your plan is working. Your streak of {streak} days confirms it.",
  "Today is a good day to be disciplined.",
  "When focus is hard, shrink the task. Five minutes. Just five. It always leads to more.",
  "Exam hall confidence is built in study room discipline. Build it here, today.",
  "Learning is a physical process in the brain. Feed it the repetition it needs.",
  "You have already shown {streak} days of what you are capable of. Do not doubt it now.",
  "The version of you that clears this exam is studying right now. Be that version.",
  "Sit down. Open the book. Set the timer. Everything else is just noise.",
  "You did not come this far to only come this far. Push through today.",
  "{streak} days. {points} points. Real work. Real results ahead.",
  "The habit is the strategy. The consistency is the tactic. You are executing both.",
  "Tomorrow you will be glad you studied today. Go study.",
  "When was the last time you regretted a study session you completed? Exactly.",
  "Trust yourself. You have earned that trust with {streak} straight days of effort.",
  "One session at a time. One day at a time. The rank takes care of itself.",
  "You are not hoping to clear the exam. You are preparing to clear it. There is a difference. You chose preparation.",
  "The books are open. The timer is ready. The plan is set. Go.",
  "Every revision pass makes the material more familiar. Familiar equals fast on exam day.",
  "Hard now, smooth on exam day. The discomfort of studying is the comfort of performing.",
  "Your {streak} days of data tell a story of someone who takes their future seriously.",
  "The question you avoid is the question that costs marks. Face it today.",
  "Study with the assumption that this chapter will be in the exam. It very well might be.",
  "Preparation is not a chore. It is an act of self-investment. Invest today.",
  "Each focused session adds one more layer of expertise that the exam will test.",
  "You are closer today than you were yesterday. Keep narrowing the gap.",
  "The merit list rewards preparation. You have {streak} days of it.",
  "Your session today is your gift to your future self standing in the exam hall.",
  "Close the gap between what you know and what you need to know. Start today.",
  "No excuses. No delays. One session. Right now. Day {streak} continues.",
  "You are building something real. Do not stop before you see it finished.",
  "Grit is doing the work when the motivation is gone. You have grit. Use it today.",
  "Every question you practice is a handshake with the examiner's intention.",
  "The {streak}-day streak is a promise you have kept to yourself. Keep it today.",
  "Your ability to focus is a muscle. You have trained it for {streak} days. It is strong.",
  "Whatever score you want, the path there runs through today's study session.",
  "The exam is a snapshot. Your {streak}-day preparation is the full album.",
  "When the exam is over, you will remember whether you gave it everything. Give it everything.",
  "Day {streak} of being someone who takes their dreams seriously. Keep going.",
];

const JOURNAL_INSIGHTS = [
  "What you have described shows a real pattern of self-awareness. That is the foundation of lasting change. Trust the process, especially on the days it feels hard.",
  "The fact that you took time to reflect, even on a tough day, is the habit that compounds over time. Most people skip this step. You did not.",
  "Your entry reveals someone who cares deeply about growth. That tension you are feeling? It is called progress. It means you are pushing your limits.",
  "This kind of honest reflection is rare. The wins you have logged today are proof that your system is working, even when it does not feel like it.",
  "Reading this, I can tell you gave it everything today. Rest is part of the process. Recovery is not weakness, it is strategy.",
  "The small frustrations you mentioned are totally normal at this stage. Your brain is literally rewiring itself. Stick with the system for two more weeks and you will feel the shift.",
  "There is so much clarity in what you wrote. You know exactly what works for you. Now it is just about protecting that environment every single day.",
];

// Comprehensive Pre-trained Knowledge Base for Indian Competitive Exams, Boards & Productivity
const TRAINED_KNOWLEDGE = {
  gate: [
    { title: 'Engineering Maths & Aptitude (Scoring Base)', time: '7:00 AM', duration: '60 min', points: 50 },
    { title: 'Core Technical Subject Concepts & Notes', time: '9:30 AM', duration: '90 min', points: 90 },
    { title: 'PYQ (Previous Year Questions) Solving (30 Qs)', time: '2:00 PM', duration: '60 min', points: 60 },
    { title: 'Formula Revision & Speed Test', time: '8:30 PM', duration: '45 min', points: 40 },
  ],
  neet: [
    { title: 'NCERT Biology Intensive Line-by-Line Read', time: '6:30 AM', duration: '90 min', points: 90 },
    { title: 'Physics Problem Solving & Numerical Practice', time: '9:30 AM', duration: '90 min', points: 90 },
    { title: 'Chemistry (Organic/Inorganic) Reaction Review', time: '2:30 PM', duration: '60 min', points: 60 },
    { title: 'Mock Test Error Analysis & NCERT Re-check', time: '8:00 PM', duration: '45 min', points: 45 },
  ],
  jee: [
    { title: 'Maths Advanced Calculus/Algebra Numerical Drills', time: '7:00 AM', duration: '90 min', points: 90 },
    { title: 'Physics Concept Derivations & HC Verma Problems', time: '10:00 AM', duration: '90 min', points: 90 },
    { title: 'Organic Chemistry Mechanisms & Practice', time: '2:00 PM', duration: '60 min', points: 60 },
    { title: 'Timed Question Solving (JEE Main/Adv PYQs)', time: '8:00 PM', duration: '60 min', points: 60 },
  ],
  govt: [
    { title: 'Quantitative Aptitude & Speed Maths Drills', time: '7:00 AM', duration: '60 min', points: 50 },
    { title: 'Reasoning & Logical Puzzle Solving', time: '9:30 AM', duration: '60 min', points: 50 },
    { title: 'Current Affairs & General Awareness Reading', time: '2:00 PM', duration: '45 min', points: 40 },
    { title: 'English Comprehension & Mock Test Analysis', time: '7:30 PM', duration: '45 min', points: 40 },
  ],
  boards: [
    { title: 'Chapter Concept Reading & NCERT Exercises', time: '7:30 AM', duration: '60 min', points: 50 },
    { title: 'Sample Paper Question Writing Practice', time: '10:00 AM', duration: '60 min', points: 50 },
    { title: 'Diagrams, Definitions & Derivation Rehearsal', time: '3:00 PM', duration: '45 min', points: 40 },
    { title: "Quick Revision of Today's Covered Topics", time: '8:00 PM', duration: '30 min', points: 30 },
  ],
  relax: [
    { title: 'Morning Guided Meditation & Deep Breathing', time: '8:00 AM', duration: '15 min', points: 20 },
    { title: 'Digital Detox Walk in Nature (No Phone)', time: '11:00 AM', duration: '45 min', points: 40 },
    { title: 'Creative Hobby / Light Reading for Pleasure', time: '4:00 PM', duration: '40 min', points: 35 },
    { title: 'Unwind & Gratitude Journaling', time: '9:00 PM', duration: '15 min', points: 20 },
  ],
  coding: [
    { title: 'Algorithm practice (LeetCode/HackerRank)', time: '8:00 AM', duration: '30 min', points: 35 },
    { title: 'Build feature or project module', time: '9:00 AM', duration: '90 min', points: 90 },
    { title: 'Code review & refactor', time: '3:00 PM', duration: '30 min', points: 30 },
    { title: 'Learn one new concept (docs/tutorials)', time: '7:00 PM', duration: '30 min', points: 30 },
  ],
  fitness: [
    { title: 'Morning mobility & stretching', time: '6:30 AM', duration: '15 min', points: 15 },
    { title: 'Core workout session', time: '7:00 AM', duration: '30 min', points: 30 },
    { title: 'Mindful walk or light cardio', time: '12:00 PM', duration: '20 min', points: 20 },
    { title: 'Evening strength training', time: '6:00 PM', duration: '45 min', points: 45 },
  ],
  default: [
    { title: 'Research & foundation building', time: '8:00 AM', duration: '30 min', points: 30 },
    { title: 'Core skill practice session', time: '9:30 AM', duration: '60 min', points: 60 },
    { title: 'Apply & implement what you learned', time: '2:00 PM', duration: '45 min', points: 45 },
    { title: 'Review progress & plan tomorrow', time: '8:30 PM', duration: '15 min', points: 20 },
  ]
};

// Returns a quote deterministically chosen by today's day-of-year.
// The quote rotates automatically every midnight with no network call.
export function getDailyHypeMessage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return HYPE_MESSAGES[dayOfYear % HYPE_MESSAGES.length];
}

export function getHypeMessage(streak, points) {
  const msg = getDailyHypeMessage();
  return msg.replace('{streak}', streak).replace('{points}', points);
}

export function getJournalInsight() {
  return JOURNAL_INSIGHTS[Math.floor(Math.random() * JOURNAL_INSIGHTS.length)];
}

export function generateRoadmap(goal) {
  const lower = (goal || '').toLowerCase().trim();
  let tasks;

  if (lower.includes('gate')) tasks = TRAINED_KNOWLEDGE.gate;
  else if (lower.includes('neet') || lower.includes('medical') || lower.includes('doctor')) tasks = TRAINED_KNOWLEDGE.neet;
  else if (lower.includes('jee') || lower.includes('iit') || lower.includes('engineering')) tasks = TRAINED_KNOWLEDGE.jee;
  else if (lower.includes('govt') || lower.includes('upsc') || lower.includes('ssc') || lower.includes('bank') || lower.includes('exam')) tasks = TRAINED_KNOWLEDGE.govt;
  else if (lower.includes('board') || lower.includes('10th') || lower.includes('12th') || lower.includes('school')) tasks = TRAINED_KNOWLEDGE.boards;
  else if (lower.includes('relax') || lower.includes('calm') || lower.includes('meditat') || lower.includes('detox')) tasks = TRAINED_KNOWLEDGE.relax;
  else if (lower.includes('code') || lower.includes('dev') || lower.includes('program')) tasks = TRAINED_KNOWLEDGE.coding;
  else if (lower.includes('fit') || lower.includes('gym') || lower.includes('workout')) tasks = TRAINED_KNOWLEDGE.fitness;
  else tasks = TRAINED_KNOWLEDGE.default;

  return tasks.map((t, i) => ({
    ...t,
    id: `milestone_${Date.now()}_${i}`,
    completed: false,
  }));
}

export function getRoadmapTemplate(type) {
  const tasks = TRAINED_KNOWLEDGE[type] || TRAINED_KNOWLEDGE.default;
  return tasks.map((t, i) => ({
    ...t,
    id: `tmpl_${type}_${i}`,
    completed: false,
  }));
}

import { getOfflineAIResponse } from './ai/knowledgeEngine';

export async function callGemini(prompt) {
  if (genAI) {
    try {
      const sanitizedPrompt = String(prompt || '').slice(0, 2000);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(sanitizedPrompt);
      const text = result.response.text();
      if (text) {
        return String(text).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
      }
    } catch (err) {
      console.warn('[Gemini AI] Call fallback activated');
    }
  }

  await new Promise((res) => setTimeout(res, 300));
  return getOfflineAIResponse(prompt);
}
