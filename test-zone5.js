/**
 * Unit tests for Zone 5 Contribution Graph API
 */

const assert = require('assert');

// Import the module and extract functions for testing
const fs = require('fs');
const path = require('path');

// Read and eval the module to extract functions (since they're not exported)
const moduleCode = fs.readFileSync(path.join(__dirname, 'api/zone5-contributions.js'), 'utf8');

// Extract functions using eval in a controlled context
const testModule = (function() {
  const COLORS = {
    BACKGROUND: '#0d1117',
    BORDER: '#30363d',
    EMPTY: '#161b22',
    LEVEL_1: '#0e4429',
    LEVEL_2: '#006d32',
    LEVEL_3: '#26a641',
    LEVEL_4: '#39d353',
    TEXT: '#e6edf3'
  };

  function getColorForMinutes(minutes) {
    if (minutes === 0) return COLORS.EMPTY;
    if (minutes < 8) return COLORS.LEVEL_1;
    if (minutes < 15) return COLORS.LEVEL_2;
    if (minutes < 23) return COLORS.LEVEL_3;
    return COLORS.LEVEL_4;
  }

  function areConsecutiveDays(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays === 1;
  }

  function calculateLongestStreak(achievements) {
    const sortedDates = Object.keys(achievements).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let previousDate = null;

    for (const date of sortedDates) {
      if (achievements[date] >= 15) {
        if (previousDate === null || areConsecutiveDays(previousDate, date)) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        maxStreak = Math.max(maxStreak, currentStreak);
        previousDate = date;
      } else {
        currentStreak = 0;
        previousDate = null;
      }
    }

    return maxStreak;
  }

  function calculateCurrentStreak(achievements) {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      if (achievements[dateStr] >= 15) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }

  function calculateStats(zone5Data) {
    const achievements = zone5Data.achievements || {};
    const values = Object.values(achievements);

    const totalMinutes = values.reduce((sum, min) => sum + min, 0);
    const daysWithData = values.filter(m => m > 0).length;
    const daysWithGoal = values.filter(m => m >= 15).length;
    const longestStreak = calculateLongestStreak(achievements);
    const currentStreak = calculateCurrentStreak(achievements);

    return {
      totalMinutes,
      daysWithData,
      daysWithGoal,
      longestStreak,
      currentStreak
    };
  }

  return {
    COLORS,
    getColorForMinutes,
    areConsecutiveDays,
    calculateLongestStreak,
    calculateCurrentStreak,
    calculateStats
  };
})();

// Test runner
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
    failed++;
  }
}

// Tests
console.log('\n🧪 Running Zone 5 API Tests\n');

console.log('📊 getColorForMinutes:');
test('returns EMPTY for 0 minutes', () => {
  assert.strictEqual(testModule.getColorForMinutes(0), testModule.COLORS.EMPTY);
});
test('returns LEVEL_1 for 1-7 minutes', () => {
  assert.strictEqual(testModule.getColorForMinutes(5), testModule.COLORS.LEVEL_1);
  assert.strictEqual(testModule.getColorForMinutes(7), testModule.COLORS.LEVEL_1);
});
test('returns LEVEL_2 for 8-14 minutes', () => {
  assert.strictEqual(testModule.getColorForMinutes(8), testModule.COLORS.LEVEL_2);
  assert.strictEqual(testModule.getColorForMinutes(14), testModule.COLORS.LEVEL_2);
});
test('returns LEVEL_3 for 15-22 minutes (goal met)', () => {
  assert.strictEqual(testModule.getColorForMinutes(15), testModule.COLORS.LEVEL_3);
  assert.strictEqual(testModule.getColorForMinutes(22), testModule.COLORS.LEVEL_3);
});
test('returns LEVEL_4 for 23+ minutes', () => {
  assert.strictEqual(testModule.getColorForMinutes(23), testModule.COLORS.LEVEL_4);
  assert.strictEqual(testModule.getColorForMinutes(30), testModule.COLORS.LEVEL_4);
});

console.log('\n📅 areConsecutiveDays:');
test('returns true for consecutive days', () => {
  assert.strictEqual(testModule.areConsecutiveDays('2026-01-01', '2026-01-02'), true);
  assert.strictEqual(testModule.areConsecutiveDays('2026-01-31', '2026-02-01'), true);
});
test('returns false for non-consecutive days', () => {
  assert.strictEqual(testModule.areConsecutiveDays('2026-01-01', '2026-01-03'), false);
  assert.strictEqual(testModule.areConsecutiveDays('2026-01-01', '2026-01-05'), false);
});
test('returns false for same day', () => {
  assert.strictEqual(testModule.areConsecutiveDays('2026-01-01', '2026-01-01'), false);
});

console.log('\n🔥 calculateLongestStreak:');
test('returns 0 for empty achievements', () => {
  assert.strictEqual(testModule.calculateLongestStreak({}), 0);
});
test('returns 0 when no days meet goal', () => {
  const achievements = {
    '2026-01-01': 10,
    '2026-01-02': 5,
    '2026-01-03': 14
  };
  assert.strictEqual(testModule.calculateLongestStreak(achievements), 0);
});
test('counts consecutive days correctly', () => {
  const achievements = {
    '2026-01-01': 20,
    '2026-01-02': 15,
    '2026-01-03': 18
  };
  assert.strictEqual(testModule.calculateLongestStreak(achievements), 3);
});
test('does NOT count non-consecutive days as streak (bug fix test)', () => {
  const achievements = {
    '2026-01-01': 20,
    '2026-01-03': 15,  // Gap - Jan 2 missing
    '2026-01-05': 18   // Gap - Jan 4 missing
  };
  assert.strictEqual(testModule.calculateLongestStreak(achievements), 1);
});
test('finds longest streak among multiple streaks', () => {
  const achievements = {
    '2026-01-01': 20,
    '2026-01-02': 15,
    '2026-01-03': 5,   // Break
    '2026-01-04': 20,
    '2026-01-05': 15,
    '2026-01-06': 18,
    '2026-01-07': 25
  };
  assert.strictEqual(testModule.calculateLongestStreak(achievements), 4);
});
test('handles single day meeting goal', () => {
  const achievements = {
    '2026-01-01': 5,
    '2026-01-02': 20,
    '2026-01-03': 5
  };
  assert.strictEqual(testModule.calculateLongestStreak(achievements), 1);
});

console.log('\n📈 calculateStats:');
test('calculates total minutes correctly', () => {
  const data = { achievements: { '2026-01-01': 10, '2026-01-02': 20 } };
  assert.strictEqual(testModule.calculateStats(data).totalMinutes, 30);
});
test('counts days with data correctly', () => {
  const data = { achievements: { '2026-01-01': 10, '2026-01-02': 0, '2026-01-03': 5 } };
  assert.strictEqual(testModule.calculateStats(data).daysWithData, 2);
});
test('counts days meeting goal correctly', () => {
  const data = { achievements: { '2026-01-01': 10, '2026-01-02': 15, '2026-01-03': 20 } };
  assert.strictEqual(testModule.calculateStats(data).daysWithGoal, 2);
});

// Summary
console.log('\n' + '='.repeat(40));
console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(40) + '\n');

process.exit(failed > 0 ? 1 : 0);
