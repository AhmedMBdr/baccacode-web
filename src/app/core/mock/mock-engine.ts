import { ApiError } from '../api/api-error';
import {
  AnswerSubmission,
  AuthResultDto,
  CodeforcesProblemDto,
  CodeforcesStatusDto,
  L10n,
  LoginRequest,
  MistakeDto,
  MistakeTopicGroupDto,
  Paged,
  ProgressOverviewDto,
  QuizAttemptDetailDto,
  QuizAttemptStartDto,
  QuizAttemptSummaryDto,
  QuizDto,
  QuizResultDto,
  RegisterRequest,
  Role,
  StudyPlanDto,
  StudyPlanItemDto,
  TopicBreakdownDto,
  TopicContentDto,
  TopicDetailsDto,
  TopicSummaryDto,
  UpdateProfileRequest,
  Lang,
  UserDto,
} from '../models';
import {
  CONTENT,
  DIAGNOSTIC_QUIZ_ID,
  PROBLEMS,
  QUESTIONS,
  QUIZZES,
  SEED_TOPICS,
  StoredQuestion,
  publicOptions,
  quizIdForTopic,
} from './mock-content';
import {
  COMPLETED_MASTERY,
  PREREQUISITE_MASTERY_THRESHOLD,
  actionsFor,
  estimateMinutes,
  nextMastery,
  priorityScore,
  reasonsFor,
  statusOf,
} from './scoring';
import { L, SeedTopic } from './seed-types';

/**
 * In-browser stand-in for the ASP.NET Core API. It is NOT part of the product:
 * it exists so the Angular app can be built and demonstrated end to end before
 * the real backend is ready. State lives in localStorage; passwords are stored
 * in clear text here only because this is fake data.
 */

const STORAGE_KEY = 'bc.mock.v1';
const DAY_MS = 86_400_000;
const PLAN_SIZE = 6;

interface MockUser {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  preferredLanguage: Lang;
  codeforcesHandle: string | null;
  curriculumVersion: string;
}

interface AnswerRecord {
  questionId: number;
  topicId: number;
  selectedOptionId: number | null;
  isCorrect: boolean;
  answeredAt: string;
  /** Snapshots (spec 13.2.1) so reviews stay accurate if content is edited later. */
  questionText: L10n;
  codeSnippet: string | null;
  selectedText: L10n | null;
  correctText: L10n;
  explanation: L10n;
}

interface AttemptRecord {
  id: number;
  userId: number;
  quizId: number;
  startedAt: string;
  submittedAt: string | null;
  questionIds: number[];
  answers: AnswerRecord[];
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
}

interface TopicProgress {
  mastery: number | null;
  lastAttemptAt: string | null;
  lastReviewedAt: string | null;
}

interface CfAccount {
  handle: string;
  rating: number;
  rank: string;
  lastSyncedAt: string | null;
  solvedProblemIds: number[];
}

interface MockState {
  v: 1;
  nextUserId: number;
  nextAttemptId: number;
  users: MockUser[];
  sessionUserId: number | null;
  progress: Record<string, Record<string, TopicProgress>>;
  attempts: AttemptRecord[];
  planDone: Record<string, Record<string, string>>;
  cf: Record<string, CfAccount>;
}

export const DEMO_EMAIL = 'demo@baccacode.dev';
export const DEMO_PASSWORD = 'Demo1234!';

export function resetMockData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

const topicById = (id: number): SeedTopic => {
  const t = SEED_TOPICS.find((x) => x.id === id);
  if (!t) throw new ApiError(404, 'TOPIC_NOT_FOUND', 'Topic not found.');
  return t;
};

function hash(text: string): number {
  let h = 7;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function rankFor(rating: number): string {
  if (rating < 1200) return 'newbie';
  if (rating < 1400) return 'pupil';
  if (rating < 1600) return 'specialist';
  if (rating < 1900) return 'expert';
  return 'candidate master';
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class MockEngine {
  private state: MockState;

  constructor(
    private readonly storage: Storage | null,
    private readonly clock: () => Date = () => new Date(),
  ) {
    this.state = this.load() ?? this.seed();
  }

  /* ───────────── persistence ───────────── */

  private load(): MockState | null {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as MockState;
      return parsed.v === 1 ? parsed : null;
    } catch {
      return null;
    }
  }

  private persist(): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* quota or private mode: the demo keeps working in memory */
    }
  }

  private now(): Date {
    return this.clock();
  }

  /* ───────────── demo data ───────────── */

  private seed(): MockState {
    this.state = {
      v: 1,
      nextUserId: 2,
      nextAttemptId: 1,
      users: [
        {
          id: 1,
          fullName: 'Ahmed Hassan',
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          role: 'Student',
          preferredLanguage: 'en',
          codeforcesHandle: null,
          curriculumVersion: '2026/2027',
        },
      ],
      sessionUserId: null,
      progress: {},
      attempts: [],
      planDone: {},
      cf: {},
    };

    // A believable history, played through the real grading code, oldest first.
    // [quizId, daysAgo, indexes of questions answered wrongly]
    const history: [number, number, number[]][] = [
      [quizIdForTopic(1), 20, []],
      [quizIdForTopic(2), 17, [3]],
      [quizIdForTopic(3), 14, [1, 3]],
      [quizIdForTopic(4), 12, [1]],
      [quizIdForTopic(3), 9, [1]],
      [quizIdForTopic(4), 6, []],
      [quizIdForTopic(5), 5, [2, 3, 4, 5]],
      [quizIdForTopic(6), 3, [3, 4]],
    ];
    for (const [quizId, daysAgo, wrong] of history) {
      const at = new Date(this.now().getTime() - daysAgo * DAY_MS);
      const quiz = QUIZZES.get(quizId)!;
      const attempt = this.openAttempt(1, quiz.id, new Date(at.getTime() - 5 * 60_000), quiz.questionIds);
      const answers = quiz.questionIds.map((qId, i) => {
        const q = QUESTIONS.get(qId)!;
        const wrongPick = q.options.find((o) => o.id !== q.correctOptionId)!.id;
        return { questionId: qId, selectedOptionId: wrong.includes(i) ? wrongPick : q.correctOptionId };
      });
      this.grade(attempt, answers, at);
    }
    this.persist();
    return this.state;
  }

  /* ───────────── auth ───────────── */

  private toUserDto(u: MockUser): UserDto {
    return {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      preferredLanguage: u.preferredLanguage,
      codeforcesHandle: this.state.cf[String(u.id)]?.handle ?? null,
      curriculumVersion: u.curriculumVersion,
    };
  }

  private authResult(u: MockUser): AuthResultDto {
    return { accessToken: `mock-token-${u.id}`, expiresInSeconds: 900, user: this.toUserDto(u) };
  }

  private user(): MockUser | null {
    return this.state.users.find((u) => u.id === this.state.sessionUserId) ?? null;
  }

  private requireUser(): MockUser {
    const u = this.user();
    if (!u) throw new ApiError(401, 'UNAUTHORIZED', 'Please sign in.');
    return u;
  }

  register(body: RegisterRequest): AuthResultDto {
    const email = body.email.trim().toLowerCase();
    if (this.state.users.some((u) => u.email === email)) {
      throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
    }
    // Validate the optional handle first so a bad handle never leaves a half-created account behind.
    const handle = body.codeforcesHandle?.trim();
    if (handle) this.assertValidHandle(handle);
    const user: MockUser = {
      id: this.state.nextUserId++,
      fullName: body.fullName.trim(),
      email,
      password: body.password,
      role: 'Student',
      preferredLanguage: body.preferredLanguage,
      codeforcesHandle: null,
      curriculumVersion: '2026/2027',
    };
    this.state.users.push(user);
    this.state.sessionUserId = user.id;
    if (handle) this.connectCodeforcesFor(user, handle);
    this.persist();
    return this.authResult(user);
  }

  login(body: LoginRequest): AuthResultDto {
    const email = body.email.trim().toLowerCase();
    const user = this.state.users.find((u) => u.email === email && u.password === body.password);
    if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    this.state.sessionUserId = user.id;
    this.persist();
    return this.authResult(user);
  }

  refresh(): AuthResultDto {
    return this.authResult(this.requireUser());
  }

  logout(): void {
    this.state.sessionUserId = null;
    this.persist();
  }

  me(): UserDto {
    return this.toUserDto(this.requireUser());
  }

  updateMe(body: UpdateProfileRequest): UserDto {
    const u = this.requireUser();
    if (body.fullName !== undefined) {
      if (!body.fullName.trim()) throw new ApiError(400, 'VALIDATION_FAILED', 'Name is required.');
      u.fullName = body.fullName.trim();
    }
    if (body.preferredLanguage) u.preferredLanguage = body.preferredLanguage;
    this.persist();
    return this.toUserDto(u);
  }

  /* ───────────── derived progress ───────────── */

  private progressOf(userId: number | null, topicId: number): TopicProgress {
    const empty: TopicProgress = { mastery: null, lastAttemptAt: null, lastReviewedAt: null };
    if (userId === null) return empty;
    return this.state.progress[String(userId)]?.[String(topicId)] ?? empty;
  }

  private setProgress(userId: number, topicId: number, p: TopicProgress): void {
    const key = String(userId);
    this.state.progress[key] ??= {};
    this.state.progress[key][String(topicId)] = p;
  }

  private submittedAttempts(userId: number): AttemptRecord[] {
    return this.state.attempts
      .filter((a) => a.userId === userId && a.submittedAt !== null)
      .sort((a, b) => a.submittedAt!.localeCompare(b.submittedAt!));
  }

  /** Every answer the student ever gave, per question, oldest first. */
  private history(userId: number): Map<number, AnswerRecord[]> {
    const map = new Map<number, AnswerRecord[]>();
    for (const attempt of this.submittedAttempts(userId)) {
      for (const a of attempt.answers) {
        const list = map.get(a.questionId) ?? [];
        list.push(a);
        map.set(a.questionId, list);
      }
    }
    return map;
  }

  private openMistakeCount(userId: number | null, topicId: number): number {
    if (userId === null) return 0;
    let open = 0;
    for (const list of this.history(userId).values()) {
      if (list[0].topicId === topicId && !list[list.length - 1].isCorrect) open++;
    }
    return open;
  }

  /** Topics that directly or indirectly need `topicId` and are not yet mastered to the threshold. */
  private dependentCount(userId: number | null, topicId: number): number {
    const seen = new Set<number>();
    const queue = [topicId];
    while (queue.length) {
      const current = queue.shift()!;
      for (const t of SEED_TOPICS) {
        if (t.prerequisites.includes(current) && !seen.has(t.id)) {
          seen.add(t.id);
          queue.push(t.id);
        }
      }
    }
    let count = 0;
    for (const id of seen) {
      const m = this.progressOf(userId, id).mastery;
      if (m === null || m < PREREQUISITE_MASTERY_THRESHOLD) count++;
    }
    return count;
  }

  private cfAccount(userId: number | null): CfAccount | null {
    return userId === null ? null : (this.state.cf[String(userId)] ?? null);
  }

  private solvedCount(userId: number | null, topicId: number): number {
    const account = this.cfAccount(userId);
    if (!account) return 0;
    return (PROBLEMS.get(topicId) ?? []).filter((p) => account.solvedProblemIds.includes(p.id)).length;
  }

  private daysSinceReview(p: TopicProgress): number | null {
    const iso = p.lastReviewedAt ?? p.lastAttemptAt;
    return iso ? Math.max(0, Math.floor((this.now().getTime() - new Date(iso).getTime()) / DAY_MS)) : null;
  }

  private summary(userId: number | null, t: SeedTopic): TopicSummaryDto {
    const p = this.progressOf(userId, t.id);
    const total = PROBLEMS.get(t.id)!.length;
    const solved = this.solvedCount(userId, t.id);
    return {
      id: t.id,
      number: t.id,
      title: L(t.title),
      summary: L(t.summary),
      masteryScore: p.mastery,
      status: statusOf(p.mastery),
      estimatedMinutes: t.minutes,
      hasQuiz: true,
      problemCount: total,
      solvedProblemCount: solved,
      prerequisites: t.prerequisites.map((id) => ({ id, title: L(topicById(id).title) })),
      reasons:
        userId === null
          ? []
          : reasonsFor({
              mastery: p.mastery,
              daysSinceReview: this.daysSinceReview(p),
              openMistakes: this.openMistakeCount(userId, t.id),
              dependentCount: this.dependentCount(userId, t.id),
              unsolvedProblems: total - solved,
              codeforcesConnected: this.cfAccount(userId) !== null,
            }),
    };
  }

  /* ───────────── topics ───────────── */

  getTopics(): TopicSummaryDto[] {
    const uid = this.user()?.id ?? null;
    return SEED_TOPICS.map((t) => this.summary(uid, t));
  }

  getTopic(id: number): TopicDetailsDto {
    const uid = this.user()?.id ?? null;
    const t = topicById(id);
    const attempts = uid === null ? [] : this.submittedAttempts(uid).filter((a) => a.quizId === quizIdForTopic(id));
    const quiz = QUIZZES.get(quizIdForTopic(id))!;
    return {
      ...this.summary(uid, t),
      unlocks: SEED_TOPICS.filter((x) => x.prerequisites.includes(id)).map((x) => ({
        id: x.id,
        title: L(x.title),
      })),
      quiz: {
        id: quiz.id,
        questionCount: quiz.questionCount,
        attemptsCount: attempts.length,
        latestScore: attempts.length ? attempts[attempts.length - 1].score : null,
        bestScore: attempts.length ? Math.max(...attempts.map((a) => a.score)) : null,
      },
    };
  }

  getTopicContent(id: number): TopicContentDto {
    topicById(id);
    return CONTENT.get(id)!;
  }

  getTopicProblems(id: number): CodeforcesProblemDto[] {
    topicById(id);
    const account = this.cfAccount(this.user()?.id ?? null);
    return PROBLEMS.get(id)!.map((p) => ({
      ...p,
      solved: account ? account.solvedProblemIds.includes(p.id) : null,
    }));
  }

  /* ───────────── progress ───────────── */

  getProgress(): ProgressOverviewDto {
    const u = this.requireUser();
    const masteries = SEED_TOPICS.map((t) => this.progressOf(u.id, t.id).mastery);
    const assessed = masteries.filter((m): m is number => m !== null);
    const attempts = this.submittedAttempts(u.id);
    return {
      overallMastery: assessed.length ? Math.round(assessed.reduce((a, b) => a + b, 0) / assessed.length) : null,
      topicsCompleted: assessed.filter((m) => m >= COMPLETED_MASTERY).length,
      topicsTotal: SEED_TOPICS.length,
      averageQuizScore: attempts.length
        ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
        : null,
      quizzesTaken: attempts.length,
      openMistakes: SEED_TOPICS.reduce((s, t) => s + this.openMistakeCount(u.id, t.id), 0),
      solvedProblems: SEED_TOPICS.reduce((s, t) => s + this.solvedCount(u.id, t.id), 0),
      totalProblems: SEED_TOPICS.reduce((s, t) => s + PROBLEMS.get(t.id)!.length, 0),
    };
  }

  /* ───────────── quizzes ───────────── */

  private quiz(id: number) {
    const q = QUIZZES.get(id);
    if (!q) throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found.');
    return q;
  }

  getQuiz(id: number): QuizDto {
    const { questionIds: _ids, ...dto } = this.quiz(id);
    return dto;
  }

  getDiagnosticQuiz(): QuizDto {
    return this.getQuiz(DIAGNOSTIC_QUIZ_ID);
  }

  private openAttempt(userId: number, quizId: number, startedAt: Date, questionIds: number[]): AttemptRecord {
    const attempt: AttemptRecord = {
      id: this.state.nextAttemptId++,
      userId,
      quizId,
      startedAt: startedAt.toISOString(),
      submittedAt: null,
      questionIds,
      answers: [],
      score: 0,
      correct: 0,
      wrong: 0,
      skipped: 0,
    };
    this.state.attempts.push(attempt);
    return attempt;
  }

  /** 14.1 — the questions are returned shuffled and WITHOUT the correct option. */
  startAttempt(quizId: number): QuizAttemptStartDto {
    const u = this.requireUser();
    const quiz = this.quiz(quizId);
    const attempt = this.openAttempt(u.id, quizId, this.now(), shuffle(quiz.questionIds));
    this.persist();
    return {
      attemptId: attempt.id,
      quizId,
      startedAt: attempt.startedAt,
      questions: attempt.questionIds.map((id) => {
        const q = QUESTIONS.get(id)!;
        return {
          id: q.id,
          topicId: q.topicId,
          text: q.text,
          codeSnippet: q.codeSnippet,
          options: shuffle(publicOptions(q)),
        };
      }),
    };
  }

  submitAttempt(attemptId: number, answers: AnswerSubmission[]): QuizResultDto {
    const u = this.requireUser();
    const attempt = this.state.attempts.find((a) => a.id === attemptId);
    if (!attempt || attempt.userId !== u.id) {
      throw new ApiError(404, 'ATTEMPT_NOT_FOUND', 'Quiz attempt not found.');
    }
    if (attempt.submittedAt) {
      throw new ApiError(400, 'QUIZ_ALREADY_SUBMITTED', 'This quiz attempt has already been submitted.');
    }
    const result = this.grade(attempt, answers, this.now());
    this.persist();
    return result;
  }

  /** 14.3 — grade, snapshot every answer, update mastery per topic. Shared with the demo seed. */
  private grade(attempt: AttemptRecord, submissions: AnswerSubmission[], at: Date): QuizResultDto {
    const records: AnswerRecord[] = attempt.questionIds.map((qId) => {
      const q: StoredQuestion = QUESTIONS.get(qId)!;
      const selectedId = submissions.find((s) => s.questionId === qId)?.selectedOptionId ?? null;
      if (selectedId !== null && !q.options.some((o) => o.id === selectedId)) {
        throw new ApiError(400, 'INVALID_OPTION', 'An answer refers to an option that is not part of the question.');
      }
      const selected = q.options.find((o) => o.id === selectedId) ?? null;
      return {
        questionId: qId,
        topicId: q.topicId,
        selectedOptionId: selectedId,
        isCorrect: selectedId === q.correctOptionId,
        answeredAt: at.toISOString(),
        questionText: q.text,
        codeSnippet: q.codeSnippet,
        selectedText: selected?.text ?? null,
        correctText: q.options.find((o) => o.id === q.correctOptionId)!.text,
        explanation: q.explanation,
      };
    });

    const total = records.length;
    const correct = records.filter((r) => r.isCorrect).length;
    const skipped = records.filter((r) => r.selectedOptionId === null).length;
    attempt.answers = records;
    attempt.correct = correct;
    attempt.skipped = skipped;
    attempt.wrong = total - correct - skipped;
    attempt.score = Math.round((correct / total) * 100);
    attempt.submittedAt = at.toISOString();

    const breakdown: TopicBreakdownDto[] = [];
    for (const topicId of new Set(records.map((r) => r.topicId))) {
      const inTopic = records.filter((r) => r.topicId === topicId);
      const topicCorrect = inTopic.filter((r) => r.isCorrect).length;
      const before = this.progressOf(attempt.userId, topicId);
      const after = nextMastery(before.mastery, Math.round((topicCorrect / inTopic.length) * 100));
      this.setProgress(attempt.userId, topicId, {
        mastery: after,
        lastAttemptAt: at.toISOString(),
        lastReviewedAt: at.toISOString(),
      });
      breakdown.push({
        topicId,
        topicTitle: L(topicById(topicId).title),
        correct: topicCorrect,
        total: inTopic.length,
        masteryBefore: before.mastery,
        masteryAfter: after,
      });
    }

    return {
      attemptId: attempt.id,
      quizId: attempt.quizId,
      score: attempt.score,
      correctCount: attempt.correct,
      wrongCount: attempt.wrong,
      skippedCount: attempt.skipped,
      topicMastery: Math.round(breakdown.reduce((s, b) => s + b.masteryAfter, 0) / breakdown.length),
      topicBreakdown: breakdown,
      studyPlanUpdated: true,
    };
  }

  private summaryOf(a: AttemptRecord, number: number): QuizAttemptSummaryDto {
    const quiz = this.quiz(a.quizId);
    return {
      attemptId: a.id,
      quizId: a.quizId,
      topicId: quiz.topicId,
      quizTitle: quiz.title,
      attemptNumber: number,
      score: a.score,
      correctCount: a.correct,
      wrongCount: a.wrong,
      skippedCount: a.skipped,
      submittedAt: a.submittedAt!,
    };
  }

  private numberedAttempts(userId: number): QuizAttemptSummaryDto[] {
    const counters = new Map<number, number>();
    return this.submittedAttempts(userId).map((a) => {
      const n = (counters.get(a.quizId) ?? 0) + 1;
      counters.set(a.quizId, n);
      return this.summaryOf(a, n);
    });
  }

  getAttempt(attemptId: number): QuizAttemptDetailDto {
    const u = this.requireUser();
    const attempt = this.state.attempts.find((a) => a.id === attemptId && a.userId === u.id);
    if (!attempt) throw new ApiError(404, 'ATTEMPT_NOT_FOUND', 'Quiz attempt not found.');
    if (!attempt.submittedAt) {
      // Never reveal answers for an open attempt.
      throw new ApiError(400, 'QUIZ_NOT_SUBMITTED', 'Submit the quiz to see the review.');
    }
    const summary = this.numberedAttempts(u.id).find((s) => s.attemptId === attemptId)!;
    return {
      ...summary,
      answers: attempt.answers.map((a) => ({
        questionId: a.questionId,
        topicId: a.topicId,
        questionText: a.questionText,
        codeSnippet: a.codeSnippet,
        selectedOptionText: a.selectedText,
        correctOptionText: a.correctText,
        isCorrect: a.isCorrect,
        explanation: a.explanation,
      })),
    };
  }

  getAttempts(q: { page: number; pageSize: number; topicId?: number }): Paged<QuizAttemptSummaryDto> {
    const u = this.requireUser();
    let all = this.numberedAttempts(u.id).reverse();
    if (q.topicId !== undefined) all = all.filter((a) => a.topicId === q.topicId);
    const start = (q.page - 1) * q.pageSize;
    return { items: all.slice(start, start + q.pageSize), page: q.page, pageSize: q.pageSize, totalCount: all.length };
  }

  /* ───────────── mistakes ───────────── */

  getMistakes(topicId?: number): MistakeTopicGroupDto[] {
    const u = this.requireUser();
    const byTopic = new Map<number, MistakeDto[]>();
    for (const [qId, list] of this.history(u.id)) {
      const wrongs = list.filter((a) => !a.isCorrect);
      if (!wrongs.length) continue;
      const latestWrong = wrongs[wrongs.length - 1];
      const q = QUESTIONS.get(qId)!;
      if (topicId !== undefined && q.topicId !== topicId) continue;
      const item: MistakeDto = {
        questionId: qId,
        quizId: quizIdForTopic(q.topicId),
        topicId: q.topicId,
        questionText: latestWrong.questionText,
        codeSnippet: latestWrong.codeSnippet,
        selectedOptionText: latestWrong.selectedText,
        correctOptionText: latestWrong.correctText,
        explanation: latestWrong.explanation,
        timesMissed: wrongs.length,
        lastMissedAt: latestWrong.answeredAt,
        resolved: list[list.length - 1].isCorrect,
      };
      byTopic.set(q.topicId, [...(byTopic.get(q.topicId) ?? []), item]);
    }
    return [...byTopic.entries()]
      .map(([id, items]) => ({
        topicId: id,
        topicTitle: L(topicById(id).title),
        openCount: items.filter((i) => !i.resolved).length,
        resolvedCount: items.filter((i) => i.resolved).length,
        items: items.sort(
          (a, b) => Number(a.resolved) - Number(b.resolved) || b.lastMissedAt.localeCompare(a.lastMissedAt),
        ),
      }))
      .sort((a, b) => b.openCount - a.openCount || a.topicId - b.topicId);
  }

  /* ───────────── study plan (11) ───────────── */

  private buildPlan(userId: number): StudyPlanItemDto[] {
    const doneMap = this.state.planDone[String(userId)] ?? {};
    const items: StudyPlanItemDto[] = [];
    for (const t of SEED_TOPICS) {
      const p = this.progressOf(userId, t.id);
      if (p.mastery !== null && p.mastery >= COMPLETED_MASTERY) continue;
      const total = PROBLEMS.get(t.id)!.length;
      const solved = this.solvedCount(userId, t.id);
      const inputs = {
        mastery: p.mastery,
        daysSinceReview: this.daysSinceReview(p),
        openMistakes: this.openMistakeCount(userId, t.id),
        dependentCount: this.dependentCount(userId, t.id),
      };
      const priority = priorityScore({ ...inputs, solved, totalProblems: total });
      const actions = actionsFor(p.mastery);
      const doneAt = doneMap[String(t.id)];
      const completed = !!doneAt && (!p.lastAttemptAt || doneAt >= p.lastAttemptAt);
      const dueDays = priority >= 60 ? 0 : priority >= 40 ? 2 : 5;
      items.push({
        id: t.id,
        topicId: t.id,
        topicTitle: L(t.title),
        quizId: quizIdForTopic(t.id),
        priority,
        masteryScore: p.mastery,
        reasons: reasonsFor({
          ...inputs,
          unsolvedProblems: total - solved,
          codeforcesConnected: this.cfAccount(userId) !== null,
        }),
        actions,
        estimatedMinutes: estimateMinutes(actions),
        dueAt: new Date(this.now().getTime() + dueDays * DAY_MS).toISOString(),
        status: completed ? 'Completed' : 'Pending',
      });
    }

    const pending = items.filter((i) => i.status === 'Pending').sort((a, b) => b.priority - a.priority);
    // "Apply prerequisite ordering rules": a prerequisite never appears after the topic that needs it.
    for (let guard = 0, moved = true; moved && guard < 20; guard++) {
      moved = false;
      for (let i = 0; i < pending.length && !moved; i++) {
        for (const pre of topicById(pending[i].topicId).prerequisites) {
          const j = pending.findIndex((x) => x.topicId === pre);
          if (j > i) {
            pending.splice(i, 0, pending.splice(j, 1)[0]);
            moved = true;
            break;
          }
        }
      }
    }
    const done = items.filter((i) => i.status === 'Completed');
    // Cap only the open items; finished ones stay visible (struck through) until a new quiz resets them.
    return [...pending.slice(0, PLAN_SIZE), ...done];
  }

  getStudyPlan(): StudyPlanDto {
    const u = this.requireUser();
    return { generatedAt: this.now().toISOString(), items: this.buildPlan(u.id) };
  }

  completePlanItem(id: number): StudyPlanItemDto {
    const u = this.requireUser();
    const key = String(u.id);
    const stamp = this.now().toISOString();
    this.state.planDone[key] ??= {};
    this.state.planDone[key][String(id)] = stamp;
    const p = this.progressOf(u.id, id);
    this.setProgress(u.id, id, { ...p, lastReviewedAt: stamp });
    this.persist();
    const item = this.buildPlan(u.id).find((i) => i.topicId === id);
    if (!item) throw new ApiError(404, 'PLAN_ITEM_NOT_FOUND', 'Study plan item not found.');
    return item;
  }

  /* ───────────── Codeforces (15) ───────────── */

  private cfStatus(userId: number): CodeforcesStatusDto {
    const a = this.cfAccount(userId);
    if (!a) {
      return { connected: false, handle: null, rating: null, rank: null, lastSyncedAt: null, solvedMappedProblems: 0 };
    }
    return {
      connected: true,
      handle: a.handle,
      rating: a.rating,
      rank: a.rank,
      lastSyncedAt: a.lastSyncedAt,
      solvedMappedProblems: a.solvedProblemIds.length,
    };
  }

  getCodeforcesStatus(): CodeforcesStatusDto {
    return this.cfStatus(this.requireUser().id);
  }

  private assertValidHandle(handle: string): void {
    if (!/^[A-Za-z0-9_.-]{3,24}$/.test(handle)) {
      throw new ApiError(400, 'VALIDATION_FAILED', 'A Codeforces handle has 3–24 letters, digits, "_", "." or "-".');
    }
    if (/nouser/i.test(handle)) {
      // Stand-in for the real user.info lookup failing.
      throw new ApiError(404, 'CODEFORCES_HANDLE_NOT_FOUND', 'No Codeforces user with this handle was found.');
    }
  }

  private connectCodeforcesFor(u: MockUser, rawHandle: string): void {
    const handle = rawHandle.trim();
    this.assertValidHandle(handle);
    const rating = 800 + (hash(handle) % 10) * 100;
    this.state.cf[String(u.id)] = { handle, rating, rank: rankFor(rating), lastSyncedAt: null, solvedProblemIds: [] };
  }

  connectCodeforces(handle: string): CodeforcesStatusDto {
    const u = this.requireUser();
    this.connectCodeforcesFor(u, handle);
    this.persist();
    return this.cfStatus(u.id);
  }

  disconnectCodeforces(): void {
    delete this.state.cf[String(this.requireUser().id)];
    this.persist();
  }

  /** Pretends to read user.status: marks a repeatable subset of catalogue problems as solved. */
  syncCodeforces(): CodeforcesStatusDto {
    const u = this.requireUser();
    const account = this.cfAccount(u.id);
    if (!account) throw new ApiError(400, 'CODEFORCES_NOT_CONNECTED', 'Connect a Codeforces handle first.');
    const seed = hash(account.handle);
    account.solvedProblemIds = [...PROBLEMS.values()]
      .flat()
      .filter((p) => (seed + p.contestId) % 3 !== 0)
      .map((p) => p.id);
    account.lastSyncedAt = this.now().toISOString();
    this.persist();
    return this.cfStatus(u.id);
  }
}
