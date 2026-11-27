import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import useStore from '../src/store/useStore.js';
import { getLocalDateString } from '../src/utils/dateUtils.js';

describe('Focus Session Accuracy & Timestamp Tracking', () => {
  beforeEach(() => {
    // Reset store state
    useStore.setState({
      focusSessions: [],
      focusLogs: [],
      totalFocusMinutes: 0,
      perfectFocusSessions: 0,
      points: 0,
      streak: 1,
      lastActiveDate: null,
    });
  });

  test('Rejects session under 1 minute (0 minutes) and does not log or award points', () => {
    const result = useStore.getState().addFocusSession({ minutes: 0 }, 0);
    assert.equal(result, false, 'Should return false indicating rejected session');

    const state = useStore.getState();
    assert.equal(state.totalFocusMinutes, 0, 'Total focus minutes should remain 0');
    assert.equal(state.points, 0, 'Points should remain 0');
    assert.equal(state.focusSessions.length, 0, 'No focus sessions should be logged');
    assert.equal((state.focusLogs || []).length, 0, 'No focus logs should be created');
  });

  test('Rejects session under 1 minute when called with primitive 0', () => {
    const result = useStore.getState().addFocusSession(0, 0);
    assert.equal(result, false);
    assert.equal(useStore.getState().totalFocusMinutes, 0);
  });

  test('Records valid 25-minute session with startedAt, endedAt, plannedMinutes', () => {
    const startedAt = new Date(Date.now() - 25 * 60000).toISOString();
    const endedAt = new Date().toISOString();
    const plannedMinutes = 25;

    const result = useStore.getState().addFocusSession({
      minutes: 25,
      startedAt,
      endedAt,
      plannedMinutes,
    }, 0);

    assert.equal(result, true, 'Should return true indicating successful session');
    const state = useStore.getState();
    assert.equal(state.totalFocusMinutes, 25);
    assert.equal(state.points, 25);
    assert.equal(state.perfectFocusSessions, 1);

    const today = getLocalDateString();
    const todaySession = state.focusSessions.find((s) => s.date === today);
    assert.ok(todaySession, 'Session for today should exist');
    assert.equal(todaySession.hours, parseFloat((25 / 60).toFixed(2)));

    const log = state.focusLogs[0];
    assert.ok(log, 'Focus log entry should exist');
    assert.equal(log.minutes, 25);
    assert.equal(log.startedAt, startedAt);
    assert.equal(log.endedAt, endedAt);
    assert.equal(log.plannedMinutes, plannedMinutes);
  });

  test('Correctly aggregates multiple valid sessions on the same local date', () => {
    useStore.getState().addFocusSession({ minutes: 30 }, 0);
    useStore.getState().addFocusSession({ minutes: 45 }, 1);

    const state = useStore.getState();
    assert.equal(state.totalFocusMinutes, 75);
    assert.equal(state.points, 75);
    assert.equal(state.perfectFocusSessions, 1); // 1st was perfect, 2nd had 1 distraction

    const today = getLocalDateString();
    const todaySession = state.focusSessions.find((s) => s.date === today);
    assert.equal(todaySession.hours, parseFloat((75 / 60).toFixed(2)));
    assert.equal(state.focusLogs.length, 2);
  });
});
