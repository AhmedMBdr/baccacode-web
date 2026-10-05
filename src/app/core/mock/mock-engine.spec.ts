import { beforeEach, describe, expect, it } from 'vitest';
import { ApiError } from '../api/api-error';
import { QUESTIONS, QUIZZES, quizIdForTopic } from './mock-content';
import { DEMO_EMAIL, DEMO_PASSWORD, MockEngine } from './mock-engine';

/** A throwaway in-memory Storage, so every test starts from a fresh demo database. */
class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(k: string) { return this.data.get(k) ?? null; }
  key(i: number) { return [...this.data.keys()][i] ?? null; }
  removeItem(k: string) { this.data.delete(k); }
  setItem(k: string, v: string) { this.data.set(k, v); }
}

const answerAll = (engine: MockEngine, quizId: number, wrongQuestionIds: number[] = []) => {
  const attempt = engine.startAttempt(quizId);
  const answers = attempt.questions.map((q) => {
    const stored = QUESTIONS.get(q.id)!;
    const wrong = stored.options.find((o) => o.id !== stored.correctOptionId)!.id;
    return { questionId: q.id, selectedOptionId: wrongQuestionIds.includes(q.id) ? wrong : stored.correctOptionId };
  });
  return { attempt, result: engine.submitAttempt(attempt.attemptId, answers) };
};

describe('MockEngine', () => {
  let engine: MockEngine;

  beforeEach(() => {
    engine = new MockEngine(new MemoryStorage());
    engine.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
  });

  it('rejects wrong credentials with a stable error code', () => {
    const fresh = new MockEngine(new MemoryStorage());
    expect(() => fresh.login({ email: DEMO_EMAIL, password: 'nope' })).toThrowError(ApiError);
    try {
      fresh.login({ email: DEMO_EMAIL, password: 'nope' });
    } catch (e) {
      expect((e as ApiError).code).toBe('INVALID_CREDENTIALS');
      expect((e as ApiError).status).toBe(401);
    }
  });

  it('never sends the correct option with a started attempt', () => {
    const attempt = engine.startAttempt(quizIdForTopic(5));
    const json = JSON.stringify(attempt);
    expect(json).not.toContain('correctOptionId');
    expect(json).not.toContain('explanation');
    expect(attempt.questions.length).toBe(QUIZZES.get(quizIdForTopic(5))!.questionCount);
  });

  it('grades, snapshots answers and updates mastery on submit', () => {
    const before = engine.getTopic(6).masteryScore;
    const { result } = answerAll(engine, quizIdForTopic(6));
    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(result.topicBreakdown[0].total);
    expect(result.topicBreakdown[0].masteryBefore).toBe(before);
    expect(engine.getTopic(6).masteryScore).toBe(result.topicMastery);
    expect(result.topicMastery).toBeGreaterThan(before ?? 0);
  });

  it('refuses to submit the same attempt twice', () => {
    const { attempt } = answerAll(engine, quizIdForTopic(7));
    expect(() => engine.submitAttempt(attempt.attemptId, [])).toThrowError(/already been submitted/);
  });

  it('hides the review of an attempt that has not been submitted', () => {
    const open = engine.startAttempt(quizIdForTopic(7));
    expect(() => engine.getAttempt(open.attemptId)).toThrowError(ApiError);
  });

  it('rejects an option that does not belong to the question', () => {
    const attempt = engine.startAttempt(quizIdForTopic(7));
    const bogus = attempt.questions.map((q) => ({ questionId: q.id, selectedOptionId: 999_999 }));
    expect(() => engine.submitAttempt(attempt.attemptId, bogus)).toThrowError(/does not belong|not part of/i);
  });

  it('scores skipped questions as not correct and counts them separately', () => {
    const attempt = engine.startAttempt(quizIdForTopic(8));
    const result = engine.submitAttempt(attempt.attemptId, []);
    expect(result.score).toBe(0);
    expect(result.skippedCount).toBe(attempt.questions.length);
    expect(result.wrongCount).toBe(0);
  });

  it('marks a mistake as resolved once the question is later answered correctly', () => {
    const firstQuestion = QUIZZES.get(quizIdForTopic(8))!.questionIds[0];
    answerAll(engine, quizIdForTopic(8), [firstQuestion]);
    const open = engine.getMistakes(8)[0].items.find((i) => i.questionId === firstQuestion)!;
    expect(open.resolved).toBe(false);
    answerAll(engine, quizIdForTopic(8));
    const resolved = engine.getMistakes(8)[0].items.find((i) => i.questionId === firstQuestion)!;
    expect(resolved.resolved).toBe(true);
    expect(resolved.timesMissed).toBe(1);
  });

  it('puts a prerequisite before the topic that needs it in the study plan', () => {
    const order = engine.getStudyPlan().items.filter((i) => i.status === 'Pending').map((i) => i.topicId);
    for (const [pre, topic] of [[5, 6], [5, 7], [5, 8], [4, 5]] as const) {
      if (order.includes(pre) && order.includes(topic)) {
        expect(order.indexOf(pre)).toBeLessThan(order.indexOf(topic));
      }
    }
  });

  it('keeps solved Codeforces problems out of mastery', () => {
    const before = engine.getProgress().overallMastery;
    engine.connectCodeforces('some_handle');
    engine.syncCodeforces();
    expect(engine.getProgress().overallMastery).toBe(before);
    expect(engine.getProgress().solvedProblems).toBeGreaterThan(0);
  });

  it('does not leave a half-created account when the optional Codeforces handle is invalid', () => {
    const fresh = new MockEngine(new MemoryStorage());
    const request = { fullName: 'Mona', email: 'mona@example.com', password: 'abc12345', preferredLanguage: 'ar' as const };
    expect(() => fresh.register({ ...request, codeforcesHandle: 'nouser_1' })).toThrowError(/handle/i);
    expect(() => fresh.register(request)).not.toThrow();
  });

  it('keeps one student’s data away from another', () => {
    engine.logout();
    engine.register({ fullName: 'New Student', email: 'new@example.com', password: 'abc12345', preferredLanguage: 'en' });
    expect(engine.getProgress().quizzesTaken).toBe(0);
    expect(engine.getMistakes()).toEqual([]);
    expect(engine.getAttempts({ page: 1, pageSize: 10 }).totalCount).toBe(0);
  });
});
