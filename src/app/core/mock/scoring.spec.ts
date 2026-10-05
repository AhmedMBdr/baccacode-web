import { describe, expect, it } from 'vitest';
import {
  actionsFor,
  estimateMinutes,
  incompletenessScore,
  nextMastery,
  prerequisiteScore,
  priorityScore,
  reasonsFor,
  recencyScore,
  repetitionScore,
  statusOf,
  weaknessScore,
} from './scoring';

/** Table-style tests of the formulas in sections 11 and 12 of the specification. */
describe('mastery (spec 12.3)', () => {
  it.each([
    [null, 80, 80], // first quiz sets mastery directly
    [50, 100, 70], // 0.6×50 + 0.4×100
    [80, 0, 48],
    [90, 90, 90],
    [33, 17, 27], // 0.6×33 + 0.4×17 = 26.6 → 27
  ])('current %s, score %s → %s', (current, score, expected) => {
    expect(nextMastery(current, score)).toBe(expected);
  });

  it.each([
    [null, 'NotAssessed'],
    [0, 'NeedsReview'],
    [69, 'NeedsReview'],
    [70, 'Developing'],
    [84, 'Developing'],
    [85, 'Mastered'],
    [100, 'Mastered'],
  ] as const)('status of %s is %s', (mastery, status) => {
    expect(statusOf(mastery)).toBe(status);
  });
});

describe('priority signals (spec 11.3)', () => {
  it('treats an unassessed topic as neutral weakness, not as the weakest', () => {
    expect(weaknessScore(null)).toBe(50);
    expect(weaknessScore(20)).toBe(80);
  });

  it.each([
    [null, 0],
    [0, 0],
    [2, 0],
    [3, 25],
    [6, 25],
    [7, 50],
    [13, 50],
    [14, 75],
    [29, 75],
    [30, 100],
  ])('recency after %s days → %s', (days, score) => {
    expect(recencyScore(days)).toBe(score);
  });

  it.each([
    [0, 0],
    [1, 30],
    [2, 30],
    [3, 60],
    [4, 60],
    [5, 100],
    [9, 100],
  ])('%s open mistakes → repetition %s', (n, score) => {
    expect(repetitionScore(n)).toBe(score);
  });

  it('caps the prerequisite signal at 100', () => {
    expect(prerequisiteScore(0)).toBe(0);
    expect(prerequisiteScore(3)).toBe(75);
    expect(prerequisiteScore(6)).toBe(100);
  });

  it('lets solved problems lower incompleteness but never below half, and zero once mastered', () => {
    expect(incompletenessScore(40, 0, 3)).toBe(100);
    expect(incompletenessScore(40, 3, 3)).toBe(50);
    expect(incompletenessScore(90, 0, 3)).toBe(0);
  });
});

describe('priority score', () => {
  it('ranks a weak, repeatedly-missed prerequisite above a mastered topic', () => {
    const weak = priorityScore({ mastery: 30, daysSinceReview: 10, openMistakes: 5, dependentCount: 3, solved: 0, totalProblems: 3 });
    const strong = priorityScore({ mastery: 95, daysSinceReview: 1, openMistakes: 0, dependentCount: 0, solved: 3, totalProblems: 3 });
    expect(weak).toBeGreaterThan(strong);
    expect(strong).toBeLessThan(10);
  });

  it('stays within 0–100 for extreme inputs', () => {
    const max = priorityScore({ mastery: 0, daysSinceReview: 99, openMistakes: 99, dependentCount: 99, solved: 0, totalProblems: 3 });
    const min = priorityScore({ mastery: 100, daysSinceReview: 0, openMistakes: 0, dependentCount: 0, solved: 3, totalProblems: 3 });
    expect(max).toBeLessThanOrEqual(100);
    expect(min).toBeGreaterThanOrEqual(0);
  });

  it('gives solved Codeforces problems a small, bounded effect', () => {
    const base = { mastery: 50, daysSinceReview: 3, openMistakes: 1, dependentCount: 1, totalProblems: 3 };
    const unsolved = priorityScore({ ...base, solved: 0 });
    const solved = priorityScore({ ...base, solved: 3 });
    expect(unsolved - solved).toBe(5); // 10% weight × 50 points
  });
});

describe('recommended actions (spec 11.4)', () => {
  it.each([
    [null, ['REVIEW_LESSON', 'TAKE_QUIZ']],
    [20, ['REVIEW_LESSON', 'REVIEW_EXAMPLES', 'WORKED_PROBLEM', 'SOLVE_PROBLEMS', 'RETAKE_QUIZ']],
    [55, ['REVIEW_MISTAKES', 'SOLVE_PROBLEMS', 'RETAKE_QUIZ']],
    [75, ['SOLVE_PROBLEMS', 'REVIEW_LESSON']],
    [90, ['CONTINUE_NEXT']],
  ])('mastery %s', (mastery, codes) => {
    expect(actionsFor(mastery).map((a) => a.code)).toEqual(codes);
  });

  it('excludes optional actions from the time estimate', () => {
    expect(estimateMinutes(actionsFor(75))).toBe(30); // 2 problems × 15, lesson is optional
  });
});

describe('reasons', () => {
  const base = { mastery: 40, daysSinceReview: 3, openMistakes: 0, dependentCount: 0, unsolvedProblems: 0, codeforcesConnected: false };

  it('is empty for a mastered topic', () => {
    expect(reasonsFor({ ...base, mastery: 90, openMistakes: 3 })).toEqual([]);
  });

  it('reports a topic never attempted as not started', () => {
    expect(reasonsFor({ ...base, mastery: null, daysSinceReview: null }).map((r) => r.code)).toEqual(['NOT_STARTED']);
  });

  it('carries the numbers the UI needs for each reason', () => {
    const reasons = reasonsFor({ ...base, openMistakes: 4, dependentCount: 2, daysSinceReview: 9, unsolvedProblems: 2, codeforcesConnected: true });
    expect(reasons).toEqual([
      { code: 'LOW_MASTERY', value: 40 },
      { code: 'OPEN_MISTAKES', value: 4 },
      { code: 'PREREQUISITE_FOR', value: 2 },
      { code: 'NOT_REVIEWED_RECENTLY', value: 9 },
      { code: 'PRACTICE_INCOMPLETE', value: 2 },
    ]);
  });

  it('only mentions unsolved problems when Codeforces is connected', () => {
    expect(reasonsFor({ ...base, unsolvedProblems: 3 }).some((r) => r.code === 'PRACTICE_INCOMPLETE')).toBe(false);
  });
});
