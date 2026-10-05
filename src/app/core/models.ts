/**
 * API contracts (DTOs). They follow Appendix A of the specification, with three
 * deliberate refinements — keep the C# DTOs in sync:
 *
 * 1. Localised text is a nested `{ ar, en }` object (`L10n`). On the C# side this
 *    is one `LocalizedText` record mapped with EF Core `OwnsOne` onto the
 *    TitleAr / TitleEn style columns from section 16.3.
 * 2. Study-plan reasons and actions are *codes + numbers*, not English sentences.
 *    The backend stays language-neutral; the SPA turns codes into Arabic/English.
 * 3. Quiz questions never contain the correct option until the attempt is submitted.
 */

export type Lang = 'ar' | 'en';

export interface L10n {
  ar: string;
  en: string;
}

export type Role = 'Student' | 'Admin';

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  preferredLanguage: Lang;
  codeforcesHandle: string | null;
  curriculumVersion: string;
}

export interface AuthResultDto {
  accessToken: string;
  expiresInSeconds: number;
  user: UserDto;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  preferredLanguage: Lang;
  codeforcesHandle?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  preferredLanguage?: Lang;
}

/* ---------- Topics & content ---------- */

/** NotAssessed = mastery is null (spec 12.2: null is more honest than 0). */
export type MasteryStatus = 'NotAssessed' | 'NeedsReview' | 'Developing' | 'Mastered';

export type ReasonCode =
  | 'LOW_MASTERY'
  | 'OPEN_MISTAKES'
  | 'PREREQUISITE_FOR'
  | 'NOT_REVIEWED_RECENTLY'
  | 'NOT_STARTED'
  | 'PRACTICE_INCOMPLETE';

export interface Reason {
  code: ReasonCode;
  /** LOW_MASTERY → mastery %, OPEN_MISTAKES → count, PREREQUISITE_FOR → dependents, NOT_REVIEWED_RECENTLY → days, PRACTICE_INCOMPLETE → unsolved problems. */
  value?: number;
}

export interface TopicRef {
  id: number;
  title: L10n;
}

export interface TopicSummaryDto {
  id: number;
  /** Position in the curriculum (1-based) — shown as 01, 02 … */
  number: number;
  title: L10n;
  summary: L10n;
  masteryScore: number | null;
  status: MasteryStatus;
  estimatedMinutes: number;
  hasQuiz: boolean;
  problemCount: number;
  solvedProblemCount: number;
  prerequisites: TopicRef[];
  /** Same reasons the study-plan engine produces (spec 10.3). Empty when nothing to flag. */
  reasons: Reason[];
}

export interface QuizRef {
  id: number;
  questionCount: number;
  attemptsCount: number;
  latestScore: number | null;
  bestScore: number | null;
}

export interface TopicDetailsDto extends TopicSummaryDto {
  /** Topics this one unlocks. */
  unlocks: TopicRef[];
  quiz: QuizRef | null;
}

export interface LessonDto {
  id: number;
  title: L10n;
  /** Sanitised-on-render Markdown (spec 10.5). */
  bodyMarkdown: L10n;
  displayOrder: number;
}

export interface CodeExampleDto {
  id: number;
  title: L10n;
  description: L10n;
  pythonCode: string;
  expectedOutput: string | null;
  explanation: L10n;
  displayOrder: number;
}

export interface WorkedProblemDto {
  id: number;
  title: L10n;
  statement: L10n;
  approach: L10n;
  pythonSolution: string;
  solutionExplanation: L10n;
  complexity: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  displayOrder: number;
}

export interface TopicContentDto {
  topicId: number;
  lessons: LessonDto[];
  codeExamples: CodeExampleDto[];
  workedProblems: WorkedProblemDto[];
}

export interface CodeforcesProblemDto {
  id: number;
  contestId: number;
  index: string;
  name: string;
  url: string;
  rating: number | null;
  tags: string[];
  displayOrder: number;
  /** null = student has not connected a Codeforces handle. */
  solved: boolean | null;
}

/* ---------- Quizzes ---------- */

export type QuizKind = 'Topic' | 'Diagnostic';

export interface QuizDto {
  id: number;
  topicId: number | null;
  kind: QuizKind;
  title: L10n;
  questionCount: number;
  estimatedMinutes: number;
}

export interface QuizOptionDto {
  id: number;
  text: L10n;
}

export interface QuizQuestionDto {
  id: number;
  topicId: number;
  text: L10n;
  /** Python snippet shown above the options. Always rendered left-to-right. */
  codeSnippet: string | null;
  options: QuizOptionDto[];
}

export interface QuizAttemptStartDto {
  attemptId: number;
  quizId: number;
  startedAt: string;
  questions: QuizQuestionDto[];
}

export interface AnswerSubmission {
  questionId: number;
  selectedOptionId: number | null;
}

export interface TopicBreakdownDto {
  topicId: number;
  topicTitle: L10n;
  correct: number;
  total: number;
  masteryBefore: number | null;
  masteryAfter: number;
}

export interface QuizResultDto {
  attemptId: number;
  quizId: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  /** Mastery of the quiz's primary topic after this attempt (spec Appendix A). */
  topicMastery: number;
  /** One entry per topic touched (diagnostic quizzes touch several). */
  topicBreakdown: TopicBreakdownDto[];
  studyPlanUpdated: boolean;
}

export interface ReviewedAnswerDto {
  questionId: number;
  topicId: number;
  /** Snapshots taken when the student answered (spec 13.2.1). */
  questionText: L10n;
  codeSnippet: string | null;
  selectedOptionText: L10n | null;
  correctOptionText: L10n;
  isCorrect: boolean;
  explanation: L10n;
}

export interface QuizAttemptSummaryDto {
  attemptId: number;
  quizId: number;
  topicId: number | null;
  quizTitle: L10n;
  attemptNumber: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  submittedAt: string;
}

export interface QuizAttemptDetailDto extends QuizAttemptSummaryDto {
  answers: ReviewedAnswerDto[];
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

/* ---------- Progress, mistakes, plan ---------- */

export interface ProgressOverviewDto {
  /** Average over assessed topics; null until the first quiz. */
  overallMastery: number | null;
  topicsCompleted: number;
  topicsTotal: number;
  averageQuizScore: number | null;
  quizzesTaken: number;
  openMistakes: number;
  solvedProblems: number;
  totalProblems: number;
}

export interface MistakeDto {
  questionId: number;
  quizId: number;
  topicId: number;
  questionText: L10n;
  codeSnippet: string | null;
  /** The answer the student gave most recently. */
  selectedOptionText: L10n | null;
  correctOptionText: L10n;
  explanation: L10n;
  timesMissed: number;
  lastMissedAt: string;
  /** True once the latest answer to this question was correct. */
  resolved: boolean;
}

export interface MistakeTopicGroupDto {
  topicId: number;
  topicTitle: L10n;
  openCount: number;
  resolvedCount: number;
  items: MistakeDto[];
}

export type ActionCode =
  | 'REVIEW_LESSON'
  | 'REVIEW_EXAMPLES'
  | 'WORKED_PROBLEM'
  | 'SOLVE_PROBLEMS'
  | 'REVIEW_MISTAKES'
  | 'TAKE_QUIZ'
  | 'RETAKE_QUIZ'
  | 'CONTINUE_NEXT';

export interface PlanAction {
  code: ActionCode;
  count?: number;
  optional?: boolean;
}

export interface StudyPlanItemDto {
  id: number;
  topicId: number;
  topicTitle: L10n;
  quizId: number | null;
  /** 0–100 (spec 11.3). */
  priority: number;
  masteryScore: number | null;
  reasons: Reason[];
  actions: PlanAction[];
  estimatedMinutes: number;
  dueAt: string | null;
  status: 'Pending' | 'Completed';
}

export interface StudyPlanDto {
  generatedAt: string;
  items: StudyPlanItemDto[];
}

/* ---------- Codeforces ---------- */

export interface CodeforcesStatusDto {
  connected: boolean;
  handle: string | null;
  rating: number | null;
  rank: string | null;
  lastSyncedAt: string | null;
  solvedMappedProblems: number;
}

/* ---------- Errors (spec 24.2) ---------- */

export interface ApiErrorBody {
  status: number;
  code: string;
  message: string;
  traceId?: string;
}
