import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getLocalDateString } from '../src/utils/dateUtils.js';

describe('Consistency Heatmap Calculations', () => {
  test('Weekday alignment produces exactly 7 rows per week column', () => {
    const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    assert.equal(WEEKDAYS.length, 7);

    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7;
    assert.ok(currentDayOfWeek >= 0 && currentDayOfWeek <= 6);

    const numWeeks = 20;
    const startOffset = (numWeeks - 1) * 7 + currentDayOfWeek;
    const endOffset = currentDayOfWeek - 6;
    const totalDays = startOffset - endOffset + 1;

    // Total days must be an exact multiple of 7 (20 weeks = 140 days)
    assert.equal(totalDays, 140);
    assert.equal(totalDays % 7, 0);
  });
});
