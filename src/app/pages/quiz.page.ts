import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BaccaApi } from '../core/api/baccacode-api';
import { I18n, I18N_PIPES } from '../core/i18n/i18n';
import { QuizAttemptStartDto, QuizResultDto } from '../core/models';
import { CodeBlock } from '../shared/code-block';
import { Icon } from '../shared/icon';
import { ErrorState, Loading } from '../shared/status';

type Phase = 'intro' | 'taking' | 'confirm' | 'result';

/**
 * Quiz runner. The questions arrive WITHOUT correct answers (spec 14.2); grading, mastery
 * and the study plan are the backend's job — this page only collects choices and shows the result.
 */
@Component({
  selector: 'bc-quiz-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, CodeBlock, Loading, ErrorState, ...I18N_PIPES],
  template: `
    @if (quiz.error()) {
      <bc-error [error]="quiz.error()" (retry)="quiz.reload()" />
    } @else if (quiz.hasValue()) {
      @let q = quiz.value();
      <nav class="bc-crumbs" [attr.aria-label]="'common.breadcrumb' | t">
        @if (q.topicId) {
          <a [routerLink]="['/topics', q.topicId]">{{ 'nav.topics' | t }}</a>
        } @else {
          <a routerLink="/dashboard">{{ 'nav.dashboard' | t }}</a>
        }
        <span aria-hidden="true">/</span>
        <span>{{ q.title | loc }}</span>
      </nav>

      @switch (phase()) {
        @case ('intro') {
          <section class="bc-panel">
            <h1 class="bc-page-title">{{ q.title | loc }}</h1>
            <ul class="bc-facts">
              <li><bc-icon name="list-ol" /> {{ 'quiz.questions' | t: { count: q.questionCount } }}</li>
              <li><bc-icon name="stopwatch" /> {{ 'topics.minutes' | t: { count: q.estimatedMinutes } }}</li>
              <li><bc-icon name="shuffle" /> {{ 'quiz.shuffled' | t }}</li>
            </ul>
            <p>{{ (q.kind === 'Diagnostic' ? 'quiz.diagnosticNote' : 'quiz.introNote') | t }}</p>
            @if (startError()) { <bc-error [error]="startError()" [retryable]="false" /> }
            <button type="button" class="btn btn-primary btn-lg" [disabled]="busy()" (click)="start()">
              @if (busy()) { <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> }
              {{ 'quiz.start' | t }}
            </button>
          </section>
        }

        @case ('taking') {
          @if (attempt(); as a) {
            @let question = a.questions[index()];
            <section class="bc-panel" aria-live="off">
              <div class="bc-quiz-head">
                <p class="mb-0" aria-live="polite">{{ 'quiz.progress' | t: { current: index() + 1, total: a.questions.length } }}</p>
                <p class="mb-0 text-body-secondary">{{ 'quiz.answered' | t: { done: answeredCount(), total: a.questions.length } }}</p>
              </div>
              <progress class="bc-progress" [max]="a.questions.length" [value]="answeredCount()" [attr.aria-label]="'quiz.answeredLabel' | t"></progress>

              <!-- QuestionCard -->
              <fieldset class="bc-question">
                <legend class="bc-question__text">{{ question.text | loc }}</legend>
                @if (question.codeSnippet) { <bc-code-block [code]="question.codeSnippet" /> }
                <div class="bc-options">
                  @for (o of question.options; track o.id) {
                    <label class="bc-option" [class.is-picked]="answers().get(question.id) === o.id">
                      <input type="radio" [name]="'q' + question.id" [value]="o.id" [checked]="answers().get(question.id) === o.id" (change)="pick(question.id, o.id)" />
                      <span class="bc-option__text">{{ o.text | loc }}</span>
                    </label>
                  }
                </div>
              </fieldset>

              <!-- QuizNavigation -->
              <div class="bc-quiz-nav">
                <button type="button" class="btn btn-outline-dark" [disabled]="index() === 0" (click)="go(index() - 1)">
                  <bc-icon [name]="i18n.dir() === 'rtl' ? 'arrow-right' : 'arrow-left'" /> {{ 'quiz.previous' | t }}
                </button>
                <ol class="bc-dots" [attr.aria-label]="'quiz.jump' | t">
                  @for (qq of a.questions; track qq.id; let i = $index) {
                    <li>
                      <button type="button" class="bc-dot" [class.is-current]="i === index()" [class.is-done]="answers().has(qq.id)"
                        [attr.aria-current]="i === index() ? 'step' : null"
                        [attr.aria-label]="('quiz.goTo' | t: { n: i + 1 }) + (answers().has(qq.id) ? ', ' + ('quiz.answeredShort' | t) : '')"
                        (click)="go(i)">{{ i + 1 }}</button>
                    </li>
                  }
                </ol>
                @if (index() < a.questions.length - 1) {
                  <button type="button" class="btn btn-primary" (click)="go(index() + 1)">
                    {{ 'quiz.next' | t }} <bc-icon [name]="i18n.dir() === 'rtl' ? 'arrow-left' : 'arrow-right'" />
                  </button>
                } @else {
                  <button type="button" class="btn btn-primary" (click)="phase.set('confirm')">{{ 'quiz.review' | t }}</button>
                }
              </div>
            </section>
          }
        }

        @case ('confirm') {
          @if (attempt(); as a) {
            <section class="bc-panel">
              <h1 class="bc-page-title">{{ 'quiz.readyTitle' | t }}</h1>
              @if (unanswered() > 0) {
                <p class="bc-callout" role="status"><bc-icon name="exclamation-triangle" /> {{ 'quiz.unanswered' | t: { count: unanswered() } }}</p>
              } @else {
                <p>{{ 'quiz.allAnswered' | t }}</p>
              }
              @if (submitError()) { <bc-error [error]="submitError()" [retryable]="false" /> }
              <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-primary btn-lg" [disabled]="busy()" (click)="submit()">
                  @if (busy()) { <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> }
                  {{ 'quiz.submit' | t }}
                </button>
                <button type="button" class="btn btn-outline-dark btn-lg" [disabled]="busy()" (click)="firstUnanswered()">{{ 'quiz.keepGoing' | t }}</button>
              </div>
            </section>
          }
        }

        @case ('result') {
          @if (result(); as r) {
            <section class="bc-panel bc-result">
              <h1 class="bc-page-title">{{ 'quiz.resultTitle' | t }}</h1>
              <div class="bc-result__score" [attr.data-band]="band(r.score)">
                <span class="bc-result__num">{{ r.score }}%</span>
                <span>{{ 'quiz.resultLine' | t: { correct: r.correctCount, total: r.correctCount + r.wrongCount + r.skippedCount } }}</span>
              </div>
              <ul class="bc-facts">
                <li><bc-icon name="check-circle" /> {{ 'quiz.correct' | t }}: {{ r.correctCount }}</li>
                <li><bc-icon name="x-circle" /> {{ 'quiz.wrong' | t }}: {{ r.wrongCount }}</li>
                @if (r.skippedCount) { <li><bc-icon name="dash-circle" /> {{ 'quiz.skipped' | t }}: {{ r.skippedCount }}</li> }
              </ul>

              <h2 class="bc-h-md">{{ 'quiz.masteryChange' | t }}</h2>
              <ul class="bc-list">
                @for (b of r.topicBreakdown; track b.topicId) {
                  <li class="bc-list__row">
                    <span>
                      <strong>{{ b.topicTitle | loc }}</strong>
                      <small class="d-block text-body-secondary">{{ 'quiz.topicCorrect' | t: { correct: b.correct, total: b.total } }}</small>
                    </span>
                    <span class="bc-delta" dir="ltr">
                      {{ b.masteryBefore === null ? '—' : b.masteryBefore + '%' }}
                      <bc-icon name="arrow-right" />
                      <strong>{{ b.masteryAfter }}%</strong>
                    </span>
                  </li>
                }
              </ul>
              @if (r.studyPlanUpdated) { <p class="bc-callout"><bc-icon name="list-check" /> {{ 'quiz.planUpdated' | t }}</p> }

              <div class="d-flex flex-wrap gap-2 mt-3">
                <a class="btn btn-primary" routerLink="/study-plan">{{ 'quiz.seePlan' | t }}</a>
                <a class="btn btn-outline-dark" [routerLink]="['/attempts', r.attemptId]">{{ 'quiz.reviewAnswers' | t }}</a>
                <button type="button" class="btn btn-outline-dark" (click)="retake()">{{ 'quiz.retake' | t }}</button>
              </div>
            </section>
          }
        }
      }
    } @else {
      <bc-loading />
    }
  `,
})
export class QuizPage {
  private readonly api = inject(BaccaApi);
  protected readonly i18n = inject(I18n);

  /** Bound from the :id route parameter. */
  readonly id = input.required<string>();

  protected readonly quiz = rxResource({ params: () => Number(this.id()), stream: ({ params }) => this.api.getQuiz(params) });

  protected readonly phase = signal<Phase>('intro');
  protected readonly attempt = signal<QuizAttemptStartDto | null>(null);
  protected readonly index = signal(0);
  protected readonly answers = signal<ReadonlyMap<number, number>>(new Map());
  protected readonly result = signal<QuizResultDto | null>(null);
  protected readonly busy = signal(false);
  protected readonly startError = signal<unknown>(null);
  protected readonly submitError = signal<unknown>(null);

  protected readonly answeredCount = computed(() => this.answers().size);
  protected readonly unanswered = computed(() => (this.attempt()?.questions.length ?? 0) - this.answers().size);

  protected start(): void {
    this.busy.set(true);
    this.startError.set(null);
    this.api.startAttempt(Number(this.id())).subscribe({
      next: (a) => {
        this.attempt.set(a);
        this.answers.set(new Map());
        this.index.set(0);
        this.result.set(null);
        this.phase.set('taking');
        this.busy.set(false);
      },
      error: (e: unknown) => {
        this.startError.set(e);
        this.busy.set(false);
      },
    });
  }

  protected pick(questionId: number, optionId: number): void {
    this.answers.update((m) => new Map(m).set(questionId, optionId));
  }

  protected go(i: number): void {
    const total = this.attempt()?.questions.length ?? 0;
    this.index.set(Math.max(0, Math.min(total - 1, i)));
    this.phase.set('taking');
  }

  protected firstUnanswered(): void {
    const a = this.attempt();
    if (!a) return;
    const i = a.questions.findIndex((q) => !this.answers().has(q.id));
    this.go(i === -1 ? 0 : i);
  }

  protected submit(): void {
    const a = this.attempt();
    if (!a) return;
    this.busy.set(true);
    this.submitError.set(null);
    const answers = a.questions.map((q) => ({ questionId: q.id, selectedOptionId: this.answers().get(q.id) ?? null }));
    this.api.submitAttempt(a.attemptId, answers).subscribe({
      next: (r) => {
        this.result.set(r);
        this.phase.set('result');
        this.busy.set(false);
        window.scrollTo({ top: 0 });
      },
      error: (e: unknown) => {
        this.submitError.set(e);
        this.busy.set(false);
      },
    });
  }

  protected retake(): void {
    this.phase.set('intro');
    this.attempt.set(null);
    this.result.set(null);
    this.start();
  }

  protected band(score: number): string {
    return score >= 85 ? 'high' : score >= 70 ? 'mid' : 'low';
  }
}
