import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getLocalDateString, isYesterday, isSameDay, getDayOfYear } from '../src/utils/dateUtils.js';

describe('Date Utilities - Local & Timezone Resilience', () => {
  test('getLocalDateString returns YYYY-MM-DD for current local time', () => {
    const now = new Date();
    const result = getLocalDateString(now);
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    assert.equal(result, `${year}-${month}-${day}`);
  });

  test('handles midnight boundary in IST (+05:30) correctly without UTC shift', () => {
    // 1:30 AM local time on Nov 27
    const local130AM = new Date(2026, 10, 27, 1, 30, 0); // Month is 0-indexed (10 = November)
    const formatted = getLocalDateString(local130AM);
    // In naive UTC toISOString(), 1:30 AM IST would shift back to Nov 26 (20:00 UTC previous day)
    // But getLocalDateString must preserve the local calendar date: Nov 27!
    assert.equal(formatted, '2026-11-27');
  });

  test('isYesterday correctly identifies yesterday vs older dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    assert.equal(isYesterday(yesterdayStr), true);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    assert.equal(isYesterday(getLocalDateString(twoDaysAgo)), false);

    const todayStr = getLocalDateString(new Date());
    assert.equal(isYesterday(todayStr), false);
  });

  test('isSameDay accurately compares date strings', () => {
    assert.equal(isSameDay('2026-11-27', '2026-11-27'), true);
    assert.equal(isSameDay('2026-11-27', '2026-11-28'), false);
    assert.equal(isSameDay(null, '2026-11-27'), false);
  });

  test('getDayOfYear calculates correct day index within year', () => {
    const jan1 = new Date(2026, 0, 1);
    const day = getDayOfYear(jan1);
    assert.equal(day, 1);
  });
});
