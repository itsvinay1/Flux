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

const HYPE_MESSAGES = [
  "With {streak} days of fire and {points} points stacked, you're not just building habits — you're building a different version of yourself. Don't stop now.",
  "Day {streak} and counting — most people quit on Day 3. You're still here, you're still grinding, and {points} points prove it.",
  "The version of you from 3 months ago would be amazed at what you've already built in {streak} days. Keep going.",
  "{points} points earned through pure discipline. You're in the top 1% of people who actually follow through. Level up today.",
  "{streak}-day streak? That's not luck, that's identity. You ARE someone who shows up every single day. Prove it again.",
  "Every distraction you've ignored, every time you chose deep work over dopamine — {points} points is just the receipt. The real prize is who you're becoming.",
  "Day {streak}. You've already won more than most people ever will. Now finish the day stronger than you started it.",
];

const JOURNAL_INSIGHTS = [
  "What you've described shows a real pattern of self-awareness — that's the foundation of lasting change. Trust the process, especially on the days it feels hard.",
  "The fact that you took time to reflect, even on a tough day, is the habit that compounds over time. Most people skip this step. You didn't.",
  "Your entry reveals someone who cares deeply about growth. That tension you're feeling? It's called progress. It means you're pushing your limits.",
  "This kind of honest reflection is rare. The wins you've logged today are proof that your system is working, even when it doesn't feel like it.",
  "Reading this, I can tell you gave it everything today. Rest is part of the process — recovery isn't weakness, it's strategy.",
  "The small frustrations you mentioned are totally normal at this stage. Your brain is literally rewiring itself. Stick with the system for two more weeks and you'll feel the shift.",
  "There's so much clarity in what you wrote. You know exactly what works for you — now it's just about protecting that environment every single day.",
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
    { title: 'Quick Revision of Today\'s Covered Topics', time: '8:00 PM', duration: '30 min', points: 30 },
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

export function getHypeMessage(streak, points) {
  const template = HYPE_MESSAGES[Math.floor(Math.random() * HYPE_MESSAGES.length)];
  return template.replace('{streak}', streak).replace('{points}', points);
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
        // Output sanitization: strip script tags and trim length
        return String(text).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
      }
    } catch (err) {
      console.warn('[Gemini AI] Call fallback activated');
    }
  }

  // Trained Offline Knowledge Memory Engine Fallback
  await new Promise((res) => setTimeout(res, 300));
  return getOfflineAIResponse(prompt);
}
