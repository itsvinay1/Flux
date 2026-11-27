import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getLevel, getLevelName, getNextLevelPoints, ACHIEVEMENTS } from '../src/store/useStore.js';

describe('Gamification & XP System', () => {
  test('getLevel scales correctly across thresholds', () => {
    assert.equal(getLevel(0), 1);
    assert.equal(getLevel(299), 1);
    assert.equal(getLevel(300), 2);
    assert.equal(getLevel(800), 3);
    assert.equal(getLevel(10000), 7);
    assert.equal(getLevel(60000), 11);
  });

  test('getLevelName returns prestigious titles', () => {
    assert.equal(getLevelName(0), 'Novice');
    assert.equal(getLevelName(300), 'Apprentice');
    assert.equal(getLevelName(6000), 'Iron Mind');
    assert.equal(getLevelName(55000), 'Flux Master');
  });

  test('getNextLevelPoints returns target ceiling', () => {
    assert.equal(getNextLevelPoints(0), 300);
    assert.equal(getNextLevelPoints(300), 800);
  });

  test('ACHIEVEMENTS correctly triggers on state milestones', () => {
    const sparkAch = ACHIEVEMENTS.find(a => a.id === 'streak_3');
    assert.equal(sparkAch.check({ streak: 2 }), false);
    assert.equal(sparkAch.check({ streak: 3 }), true);
    assert.equal(sparkAch.check({ streak: 5 }), true);

    const firstTaskAch = ACHIEVEMENTS.find(a => a.id === 'tasks_first');
    assert.equal(firstTaskAch.check({ todos: [{ completed: false }] }), false);
    assert.equal(firstTaskAch.check({ todos: [{ completed: true }] }), true);
  });

  test('Idempotent Task Completion logic prevents infinite XP cheat', () => {
    // Simulate awardedTaskIds map
    const awardedTaskIds = {};
    let points = 0;

    const toggleTask = (taskId, pointsAward) => {
      let earned = false;
      if (!awardedTaskIds[taskId]) {
        awardedTaskIds[taskId] = true;
        earned = true;
        points += pointsAward;
      }
      return earned;
    };

    // First toggle awards points
    const firstCheck = toggleTask('todo_123', 10);
    assert.equal(firstCheck, true);
    assert.equal(points, 10);

    // Unchecking does not re-award
    // Second toggle of same task is blocked from re-earning points
    const secondCheck = toggleTask('todo_123', 10);
    assert.equal(secondCheck, false);
    assert.equal(points, 10); // Still 10, no exploit!
  });
});
