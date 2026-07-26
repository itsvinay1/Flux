/**
 * FLUX — Smart AI Cache
 *
 * Problem: Calling Gemini API on every tap costs money and wastes quota.
 *
 * Solution:
 * 1. Cache every AI response in localStorage with a TTL
 * 2. Use a context fingerprint as cache key — same streak/rating = same cache
 * 3. Rate-limit by call type (hype: 5/day, journal: 3/day, roadmap: 10/day)
 * 4. Pre-pool curated responses for zero-latency fallback
 * 5. Batch: combine multiple AI needs into one API call where possible
 */

const CACHE_KEY = 'flux-ai-cache';
const RATE_KEY = 'flux-ai-rates';

// TTL in milliseconds for each response type
const TTL = {
  hype: 4 * 60 * 60 * 1000,       // 4 hours — same streak = same message is fine
  journal: 24 * 60 * 60 * 1000,    // 24 hours — insight per journal entry
  roadmap: 7 * 24 * 60 * 60 * 1000, // 7 days — roadmap for same goal reused
  weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Daily call limits per feature (free tier)
const DAILY_LIMITS = {
  hype: 5,
  journal: 3,
  roadmap: 10,
  weekly: 1,
};

// ─── Cache Helpers ────────────────────────────────────────────────────────────

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch { return {}; }
}

function saveCache(cache) {
  try {
    const fresh = {};
    const now = Date.now();
    const entries = Object.entries(cache)
      .filter(([, v]) => v && v.expiresAt > now)
      .slice(-50); // Cap max 50 active cache entries
    for (const [k, v] of entries) {
      fresh[k] = v;
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
  } catch (e) {
    // Storage quota fallback
  }
}

function getCached(key) {
  const cache = loadCache();
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    delete cache[key];
    saveCache(cache);
    return null;
  }
  return entry.value;
}

function setCached(key, value, ttl) {
  if (typeof value !== 'string' || !value.trim()) return;
  const safeVal = value.slice(0, 1500);
  const cache = loadCache();
  cache[key] = { value: safeVal, expiresAt: Date.now() + ttl, savedAt: Date.now() };
  saveCache(cache);
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

function loadRates() {
  try {
    const data = JSON.parse(localStorage.getItem(RATE_KEY) || '{}');
    const today = new Date().toDateString();
    if (!data || typeof data.counts !== 'object' || data.date !== today) {
      return { date: today, counts: {} };
    }
    return data;
  } catch {
    return { date: new Date().toDateString(), counts: {} };
  }
}

function saveRates(rates) {
  localStorage.setItem(RATE_KEY, JSON.stringify(rates));
}

export function getRemainingCalls(type) {
  const rates = loadRates();
  const used = rates.counts[type] || 0;
  return Math.max(0, DAILY_LIMITS[type] - used);
}

function incrementRate(type) {
  const rates = loadRates();
  rates.counts[type] = (rates.counts[type] || 0) + 1;
  saveRates(rates);
}

function isRateLimited(type) {
  return getRemainingCalls(type) <= 0;
}

// ─── Context Fingerprint ──────────────────────────────────────────────────────
// Creates a stable cache key from the relevant context
// If streak + level are same → same hype message is fine

function fingerprint(type, context) {
  switch (type) {
    case 'hype':
      // Group by streak bracket (0-7, 8-30, 31-60, 60+) and level
      const streakBracket = context.streak < 8 ? 'new'
        : context.streak < 31 ? 'building'
        : context.streak < 61 ? 'strong' : 'legend';
      return `hype_${streakBracket}_L${context.level}`;

    case 'journal': {
      const raw = String(context.entry || '').trim();
      const hash = raw.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 1000000, 0);
      return `journal_${raw.slice(0, 25).replace(/\s+/g, '_')}_${raw.length}_${hash}`;
    }

    case 'roadmap':
      // Key by normalized goal text
      return `roadmap_${(context.goal || '').toLowerCase().trim().replace(/\s+/g, '_').slice(0, 30)}`;

    case 'weekly':
      // Key by week number
      const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
      return `weekly_${week}`;

    default:
      return `${type}_${Date.now()}`;
  }
}

// ─── Main AI Call Wrapper ─────────────────────────────────────────────────────

/**
 * Call AI with automatic caching, rate limiting, and fallback.
 *
 * @param {string} type - 'hype' | 'journal' | 'roadmap' | 'weekly'
 * @param {object} context - Data to build the prompt from
 * @param {function} apiFn - Actual Gemini call (async fn returning string)
 * @param {function} fallbackFn - Local fallback (sync fn returning string)
 * @returns {{ result: string, source: 'cache'|'api'|'fallback', remaining: number }}
 */
export async function cachedAICall(type, context, apiFn, fallbackFn) {
  const cacheKey = fingerprint(type, context);
  const remaining = getRemainingCalls(type);

  // 1. Check cache first — fastest path, zero cost
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[AI Cache] HIT for ${type} (key: ${cacheKey})`);
    return { result: cached, source: 'cache', remaining };
  }

  // 2. Check rate limit
  if (isRateLimited(type)) {
    console.log(`[AI Cache] RATE LIMITED for ${type} — using fallback`);
    const fb = fallbackFn(context);
    return { result: fb, source: 'fallback', remaining: 0 };
  }

  // 3. Try actual API call
  try {
    const result = await apiFn(context);
    if (result) {
      incrementRate(type);
      setCached(cacheKey, result, TTL[type]);
      console.log(`[AI Cache] MISS — fetched from API for ${type}`);
      return { result, source: 'api', remaining: getRemainingCalls(type) };
    }
    throw new Error('Empty API response');
  } catch (err) {
    // 4. API failed — use fallback (never show error to user)
    console.warn(`[AI Cache] API failed for ${type}:`, err.message);
    const fb = fallbackFn(context);
    return { result: fb, source: 'fallback', remaining };
  }
}

// ─── Cache Stats (for Profile Dashboard) ─────────────────────────────────────

export function getAICacheStats() {
  const cache = loadCache();
  const rates = loadRates();
  const now = Date.now();

  const entries = Object.entries(cache);
  const active = entries.filter(([, v]) => v.expiresAt > now);

  return {
    totalCached: active.length,
    savedAPICallsToday: Object.values(rates.counts || {}).reduce((a, b) => a + b, 0),
    dailyUsage: rates.counts || {},
    dailyLimits: DAILY_LIMITS,
    remainingCalls: Object.fromEntries(
      Object.keys(DAILY_LIMITS).map((k) => [k, getRemainingCalls(k)])
    ),
  };
}

export function clearAICache() {
  localStorage.removeItem(CACHE_KEY);
}
