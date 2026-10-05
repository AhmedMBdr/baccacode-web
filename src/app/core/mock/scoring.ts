import { MasteryStatus, PlanAction, Reason } from '../models';

/**
 * Pure scoring rules from sections 11 and 12 of the specification.
 * They live in the *mock* backend only — in production the ASP.NET Core services
 * own these rules. They are kept pure so they can be unit-tested table-style (29.1)
 * and ported to C# line by line.
 */

/** Mastery needed before a topic stops counting as an unmet prerequisite (11.3). */
export const PREREQUISITE_MASTERY_THRESHOLD = 70;
/** Mastery at which a topic counts as completed (11.4: "Continue to next topic"). */
export const COMPLETED_MASTERY = 85;

export const PRIORITY_WEIGHTS = {
  weakness: 0.4,
  recency: 0.2,
  repetition: 0.15,
  prerequisite: 0.15,
  incompleteness: 0.1,
} as const;

/** 12.3 — NewMastery = 0.60 × CurrentMastery + 0.40 × LatestQuizScore. First quiz sets it directly. */
export function nextMastery(current: number | null, latestScore: number): number {
  if (current === null) return Math.round(latestScore);
  return Math.round(0.6 * current + 0.4 * latestScore);
}

export function statusOf(mastery: number | null): MasteryStatus {
  if (mastery === null) return 'NotAssessed';
  if (mastery >= COMPLETED_MASTERY) return 'Mastered';
  if (mastery >= PREREQUISITE_MASTERY_THRESHOLD) return 'Developing';
  return 'NeedsReview';
}

/** 11.3 WeaknessScore. Unassessed topics get a neutral 50 so they don't outrank known weak spots. */
export function weaknessScore(mastery: number | null): number {
  return mastery === null ? 50 : 100 - mastery;
}

/** 11.3 RecencyScore bands. A topic never attempted cannot be "stale". */
export function recencyScore(daysSinceReview: number | null): number {
  if (daysSinceReview === null) return 0;
  if (daysSinceReview <= 2) return 0;
  if (daysSinceReview <= 6) return 25;
  if (daysSinceReview <= 13) return 50;
  if (daysSinceReview <= 29) return 75;
  return 100;
}

/** 11.3 RepetitionScore bands (counts unresolved mistakes). */
export function repetitionScore(openMistakes: number): number {
  if (openMistakes <= 0) return 0;
  if (openMistakes <= 2) return 30;
  if (openMistakes <= 4) return 60;
  return 100;
}

/** 11.3 PrerequisiteScore = min(100, 25 × DependentCount). */
export function prerequisiteScore(dependentCount: number): number {
  return Math.min(100, 25 * dependentCount);
}

/**
 * 11.3 IncompletenessScore + 15.8: solved Codeforces problems reduce it (evidence
 * of practice) but never touch MasteryScore.
 */
export function incompletenessScore(mastery: number | null, solved: number, total: number): number {
  if (mastery !== null && mastery >= COMPLETED_MASTERY) return 0;
  const ratio = total > 0 ? solved / total : 0;
  return Math.round(100 * (1 - 0.5 * ratio));
}

export interface PriorityInputs {
  mastery: number | null;
  daysSinceReview: number | null;
  openMistakes: number;
  dependentCount: number;
  solved: number;
  totalProblems: number;
}

export function priorityScore(i: PriorityInputs): number {
  const w = PRIORITY_WEIGHTS;
  const value =
    w.weakness * weaknessScore(i.mastery) +
    w.recency * recencyScore(i.daysSinceReview) +
    w.repetition * repetitionScore(i.openMistakes) +
    w.prerequisite * prerequisiteScore(i.dependentCount) +
    w.incompleteness * incompletenessScore(i.mastery, i.solved, i.totalProblems);
  return Math.round(value);
}

/** 11.4 — mastery band → recommended actions. */
export function actionsFor(mastery: number | null): PlanAction[] {
  if (mastery === null) return [{ code: 'REVIEW_LESSON' }, { code: 'TAKE_QUIZ' }];
  if (mastery < 40) {
    return [
      { code: 'REVIEW_LESSON' },
      { code: 'REVIEW_EXAMPLES' },
      { code: 'WORKED_PROBLEM' },
      { code: 'SOLVE_PROBLEMS', count: 2 },
      { code: 'RETAKE_QUIZ' },
    ];
  }
  if (mastery < 70) {
    return [{ code: 'REVIEW_MISTAKES' }, { code: 'SOLVE_PROBLEMS', count: 2 }, { code: 'RETAKE_QUIZ' }];
  }
  if (mastery < COMPLETED_MASTERY) {
    return [{ code: 'SOLVE_PROBLEMS', count: 2 }, { code: 'REVIEW_LESSON', optional: true }];
  }
  return [{ code: 'CONTINUE_NEXT' }];
}

const MINUTES: Record<string, number> = {
  REVIEW_LESSON: 15,
  REVIEW_EXAMPLES: 10,
  WORKED_PROBLEM: 15,
  SOLVE_PROBLEMS: 15,
  REVIEW_MISTAKES: 10,
  TAKE_QUIZ: 10,
  RETAKE_QUIZ: 10,
  CONTINUE_NEXT: 0,
};

export function estimateMinutes(actions: PlanAction[]): number {
  return actions
    .filter((a) => !a.optional)
    .reduce((sum, a) => sum + (MINUTES[a.code] ?? 0) * (a.count ?? 1), 0);
}

export interface ReasonInputs {
  mastery: number | null;
  daysSinceReview: number | null;
  openMistakes: number;
  dependentCount: number;
  unsolvedProblems: number;
  codeforcesConnected: boolean;
}

/** The "Why" text shared by the topic browser (10.3) and the study plan (11.4). */
export function reasonsFor(i: ReasonInputs): Reason[] {
  if (i.mastery !== null && i.mastery >= COMPLETED_MASTERY) return [];
  const out: Reason[] = [];
  if (i.mastery === null) out.push({ code: 'NOT_STARTED' });
  if (i.mastery !== null && i.mastery < PREREQUISITE_MASTERY_THRESHOLD) {
    out.push({ code: 'LOW_MASTERY', value: i.mastery });
  }
  if (i.openMistakes > 0) out.push({ code: 'OPEN_MISTAKES', value: i.openMistakes });
  if (i.dependentCount > 0 && (i.mastery === null || i.mastery < PREREQUISITE_MASTERY_THRESHOLD)) {
    out.push({ code: 'PREREQUISITE_FOR', value: i.dependentCount });
  }
  if (i.daysSinceReview !== null && i.daysSinceReview >= 7) {
    out.push({ code: 'NOT_REVIEWED_RECENTLY', value: i.daysSinceReview });
  }
  if (i.codeforcesConnected && i.unsolvedProblems > 0) {
    out.push({ code: 'PRACTICE_INCOMPLETE', value: i.unsolvedProblems });
  }
  return out;
}
