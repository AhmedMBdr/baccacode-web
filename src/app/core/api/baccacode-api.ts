import { Observable } from 'rxjs';
import {
  AnswerSubmission,
  AuthResultDto,
  CodeforcesProblemDto,
  CodeforcesStatusDto,
  LoginRequest,
  MistakeTopicGroupDto,
  Paged,
  ProgressOverviewDto,
  QuizAttemptDetailDto,
  QuizAttemptStartDto,
  QuizAttemptSummaryDto,
  QuizDto,
  QuizResultDto,
  RegisterRequest,
  StudyPlanDto,
  StudyPlanItemDto,
  TopicContentDto,
  TopicDetailsDto,
  TopicSummaryDto,
  UpdateProfileRequest,
  UserDto,
} from '../models';

/**
 * The single seam between the SPA and the backend. Pages only ever inject this
 * class; `HttpBaccaApi` talks to ASP.NET Core, `MockBaccaApi` fakes it.
 * Every method maps 1:1 to an endpoint in section 22 of the specification.
 */
export abstract class BaccaApi {
  /* Auth (22.2) */
  abstract register(body: RegisterRequest): Observable<AuthResultDto>;
  abstract login(body: LoginRequest): Observable<AuthResultDto>;
  abstract refresh(): Observable<AuthResultDto>;
  abstract logout(): Observable<void>;
  abstract me(): Observable<UserDto>;
  abstract updateMe(body: UpdateProfileRequest): Observable<UserDto>;

  /* Topics (22.3) */
  abstract getTopics(): Observable<TopicSummaryDto[]>;
  abstract getTopic(id: number): Observable<TopicDetailsDto>;
  abstract getTopicContent(id: number): Observable<TopicContentDto>;
  abstract getTopicProblems(id: number): Observable<CodeforcesProblemDto[]>;

  /* Progress (22.4) */
  abstract getProgress(): Observable<ProgressOverviewDto>;

  /* Quizzes (22.5) */
  abstract getQuiz(id: number): Observable<QuizDto>;
  /** Optional extension: 3–5 question check-up after registration (spec 8.1.1). */
  abstract getDiagnosticQuiz(): Observable<QuizDto>;
  abstract startAttempt(quizId: number): Observable<QuizAttemptStartDto>;
  abstract submitAttempt(attemptId: number, answers: AnswerSubmission[]): Observable<QuizResultDto>;
  abstract getAttempt(attemptId: number): Observable<QuizAttemptDetailDto>;
  abstract getAttempts(query: {
    page: number;
    pageSize: number;
    topicId?: number;
  }): Observable<Paged<QuizAttemptSummaryDto>>;

  /* Mistakes (22.6) */
  abstract getMistakes(topicId?: number): Observable<MistakeTopicGroupDto[]>;

  /* Study plan (22.7) */
  abstract getStudyPlan(): Observable<StudyPlanDto>;
  abstract recalculateStudyPlan(): Observable<StudyPlanDto>;
  abstract completePlanItem(id: number): Observable<StudyPlanItemDto>;

  /* Codeforces (22.8) */
  abstract getCodeforcesStatus(): Observable<CodeforcesStatusDto>;
  abstract connectCodeforces(handle: string): Observable<CodeforcesStatusDto>;
  abstract disconnectCodeforces(): Observable<void>;
  abstract syncCodeforces(): Observable<CodeforcesStatusDto>;
}
