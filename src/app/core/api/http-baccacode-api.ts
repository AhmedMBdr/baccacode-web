import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config';
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
import { BaccaApi } from './baccacode-api';

/** Real implementation: plain HttpClient calls against the ASP.NET Core API. */
@Injectable()
export class HttpBaccaApi extends BaccaApi {
  private readonly http = inject(HttpClient);
  private readonly base = APP_CONFIG.apiBaseUrl;

  /* The refresh token lives in an httpOnly cookie set by the API, so these two
     calls must send credentials. The access token is kept in memory only. */
  register(body: RegisterRequest): Observable<AuthResultDto> {
    return this.http.post<AuthResultDto>(`${this.base}/auth/register`, body, { withCredentials: true });
  }
  login(body: LoginRequest): Observable<AuthResultDto> {
    return this.http.post<AuthResultDto>(`${this.base}/auth/login`, body, { withCredentials: true });
  }
  refresh(): Observable<AuthResultDto> {
    return this.http.post<AuthResultDto>(`${this.base}/auth/refresh`, null, { withCredentials: true });
  }
  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/logout`, null, { withCredentials: true });
  }
  me(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.base}/auth/me`);
  }
  updateMe(body: UpdateProfileRequest): Observable<UserDto> {
    return this.http.patch<UserDto>(`${this.base}/students/me`, body);
  }

  getTopics(): Observable<TopicSummaryDto[]> {
    return this.http.get<TopicSummaryDto[]>(`${this.base}/topics`);
  }
  getTopic(id: number): Observable<TopicDetailsDto> {
    return this.http.get<TopicDetailsDto>(`${this.base}/topics/${id}`);
  }
  getTopicContent(id: number): Observable<TopicContentDto> {
    return this.http.get<TopicContentDto>(`${this.base}/topics/${id}/content`);
  }
  getTopicProblems(id: number): Observable<CodeforcesProblemDto[]> {
    return this.http.get<CodeforcesProblemDto[]>(`${this.base}/topics/${id}/problems`);
  }

  getProgress(): Observable<ProgressOverviewDto> {
    return this.http.get<ProgressOverviewDto>(`${this.base}/students/me/progress`);
  }

  getQuiz(id: number): Observable<QuizDto> {
    return this.http.get<QuizDto>(`${this.base}/quizzes/${id}`);
  }
  getDiagnosticQuiz(): Observable<QuizDto> {
    return this.http.get<QuizDto>(`${this.base}/quizzes/diagnostic`);
  }
  startAttempt(quizId: number): Observable<QuizAttemptStartDto> {
    return this.http.post<QuizAttemptStartDto>(`${this.base}/quizzes/${quizId}/attempts`, null);
  }
  submitAttempt(attemptId: number, answers: AnswerSubmission[]): Observable<QuizResultDto> {
    return this.http.post<QuizResultDto>(`${this.base}/quiz-attempts/${attemptId}/submit`, { answers });
  }
  getAttempt(attemptId: number): Observable<QuizAttemptDetailDto> {
    return this.http.get<QuizAttemptDetailDto>(`${this.base}/quiz-attempts/${attemptId}`);
  }
  getAttempts(q: { page: number; pageSize: number; topicId?: number }): Observable<Paged<QuizAttemptSummaryDto>> {
    let params = new HttpParams().set('page', q.page).set('pageSize', q.pageSize);
    if (q.topicId !== undefined) params = params.set('topicId', q.topicId);
    return this.http.get<Paged<QuizAttemptSummaryDto>>(`${this.base}/students/me/quiz-attempts`, { params });
  }

  getMistakes(topicId?: number): Observable<MistakeTopicGroupDto[]> {
    const url =
      topicId === undefined
        ? `${this.base}/students/me/mistakes`
        : `${this.base}/students/me/mistakes/topics/${topicId}`;
    return this.http.get<MistakeTopicGroupDto[]>(url);
  }

  getStudyPlan(): Observable<StudyPlanDto> {
    return this.http.get<StudyPlanDto>(`${this.base}/students/me/study-plan`);
  }
  recalculateStudyPlan(): Observable<StudyPlanDto> {
    return this.http.post<StudyPlanDto>(`${this.base}/students/me/study-plan/recalculate`, null);
  }
  completePlanItem(id: number): Observable<StudyPlanItemDto> {
    return this.http.patch<StudyPlanItemDto>(`${this.base}/study-plan-items/${id}/complete`, null);
  }

  getCodeforcesStatus(): Observable<CodeforcesStatusDto> {
    return this.http.get<CodeforcesStatusDto>(`${this.base}/codeforces/status`);
  }
  connectCodeforces(handle: string): Observable<CodeforcesStatusDto> {
    return this.http.post<CodeforcesStatusDto>(`${this.base}/codeforces/connect`, { handle });
  }
  disconnectCodeforces(): Observable<void> {
    return this.http.delete<void>(`${this.base}/codeforces/connect`);
  }
  syncCodeforces(): Observable<CodeforcesStatusDto> {
    return this.http.post<CodeforcesStatusDto>(`${this.base}/codeforces/sync`, null);
  }
}
