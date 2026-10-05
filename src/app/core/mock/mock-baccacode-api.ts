import { Injectable } from '@angular/core';
import { Observable, defer, of, throwError, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ApiError } from '../api/api-error';
import { BaccaApi } from '../api/baccacode-api';
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
import { MockEngine } from './mock-engine';

/** Fake network: every call resolves after a short, slightly random delay. */
@Injectable()
export class MockBaccaApi extends BaccaApi {
  private readonly engine = new MockEngine(typeof localStorage === 'undefined' ? null : localStorage);

  private call<T>(fn: () => T, latencyMs = 160): Observable<T> {
    return timer(latencyMs + Math.random() * 140).pipe(
      mergeMap(() =>
        defer(() => {
          try {
            return of(fn());
          } catch (e) {
            return throwError(() => ApiError.from(e));
          }
        }),
      ),
    );
  }

  register(body: RegisterRequest): Observable<AuthResultDto> {
    return this.call(() => this.engine.register(body), 350);
  }
  login(body: LoginRequest): Observable<AuthResultDto> {
    return this.call(() => this.engine.login(body), 350);
  }
  refresh(): Observable<AuthResultDto> {
    return this.call(() => this.engine.refresh(), 40);
  }
  logout(): Observable<void> {
    return this.call(() => this.engine.logout(), 40);
  }
  me(): Observable<UserDto> {
    return this.call(() => this.engine.me());
  }
  updateMe(body: UpdateProfileRequest): Observable<UserDto> {
    return this.call(() => this.engine.updateMe(body));
  }

  getTopics(): Observable<TopicSummaryDto[]> {
    return this.call(() => this.engine.getTopics());
  }
  getTopic(id: number): Observable<TopicDetailsDto> {
    return this.call(() => this.engine.getTopic(id));
  }
  getTopicContent(id: number): Observable<TopicContentDto> {
    return this.call(() => this.engine.getTopicContent(id));
  }
  getTopicProblems(id: number): Observable<CodeforcesProblemDto[]> {
    return this.call(() => this.engine.getTopicProblems(id));
  }

  getProgress(): Observable<ProgressOverviewDto> {
    return this.call(() => this.engine.getProgress());
  }

  getQuiz(id: number): Observable<QuizDto> {
    return this.call(() => this.engine.getQuiz(id));
  }
  getDiagnosticQuiz(): Observable<QuizDto> {
    return this.call(() => this.engine.getDiagnosticQuiz());
  }
  startAttempt(quizId: number): Observable<QuizAttemptStartDto> {
    return this.call(() => this.engine.startAttempt(quizId), 250);
  }
  submitAttempt(attemptId: number, answers: AnswerSubmission[]): Observable<QuizResultDto> {
    return this.call(() => this.engine.submitAttempt(attemptId, answers), 450);
  }
  getAttempt(attemptId: number): Observable<QuizAttemptDetailDto> {
    return this.call(() => this.engine.getAttempt(attemptId));
  }
  getAttempts(q: { page: number; pageSize: number; topicId?: number }): Observable<Paged<QuizAttemptSummaryDto>> {
    return this.call(() => this.engine.getAttempts(q));
  }

  getMistakes(topicId?: number): Observable<MistakeTopicGroupDto[]> {
    return this.call(() => this.engine.getMistakes(topicId));
  }

  getStudyPlan(): Observable<StudyPlanDto> {
    return this.call(() => this.engine.getStudyPlan());
  }
  recalculateStudyPlan(): Observable<StudyPlanDto> {
    return this.call(() => this.engine.getStudyPlan(), 500);
  }
  completePlanItem(id: number): Observable<StudyPlanItemDto> {
    return this.call(() => this.engine.completePlanItem(id));
  }

  getCodeforcesStatus(): Observable<CodeforcesStatusDto> {
    return this.call(() => this.engine.getCodeforcesStatus());
  }
  connectCodeforces(handle: string): Observable<CodeforcesStatusDto> {
    return this.call(() => this.engine.connectCodeforces(handle), 500);
  }
  disconnectCodeforces(): Observable<void> {
    return this.call(() => this.engine.disconnectCodeforces());
  }
  syncCodeforces(): Observable<CodeforcesStatusDto> {
    return this.call(() => this.engine.syncCodeforces(), 900);
  }
}

