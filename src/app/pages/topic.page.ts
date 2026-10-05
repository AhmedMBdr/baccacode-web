import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BaccaApi } from '../core/api/baccacode-api';
import { Auth } from '../core/auth/auth';
import { I18n, I18N_PIPES } from '../core/i18n/i18n';
import { WorkedProblemDto } from '../core/models';
import { CodeBlock } from '../shared/code-block';
import { Icon } from '../shared/icon';
import { Markdown } from '../shared/markdown';
import { Mastery, StatusChip } from '../shared/mastery';
import { Reasons } from '../shared/reasons';
import { ErrorState, Loading } from '../shared/status';

const SECTIONS = ['lesson', 'examples', 'worked', 'practice', 'quiz'] as const;

/**
 * One coherent learning page (spec 10.4): explanation → examples → worked problem →
 * Codeforces practice → quiz. Few components on purpose (spec 18.3).
 */
@Component({
  selector: 'bc-topic-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Markdown, CodeBlock, Mastery, StatusChip, Reasons, Loading, ErrorState, ...I18N_PIPES],
  template: `
    @if (data.error()) {
      <bc-error [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.hasValue()) {
      @let d = data.value();
      @let topic = d.topic;
      <nav class="bc-crumbs" [attr.aria-label]="'common.breadcrumb' | t">
        <a routerLink="/topics">{{ 'nav.topics' | t }}</a>
        <span aria-hidden="true">/</span>
        <span>{{ topic.title | loc }}</span>
      </nav>

      <header class="bc-topic-head">
        <div>
          <h1 class="bc-page-title">
            <span class="bc-topic-head__num" aria-hidden="true">{{ topic.number < 10 ? '0' + topic.number : topic.number }}</span>
            {{ topic.title | loc }}
          </h1>
          <p class="bc-lead mb-3">{{ topic.summary | loc }}</p>
          <div class="bc-topic__status mb-2">
            <bc-mastery [value]="topic.masteryScore" />
            <bc-status [status]="topic.status" />
          </div>
          <bc-reasons [reasons]="topic.reasons" />
          @if (topic.prerequisites.length) {
            <p class="bc-topic__line mb-0">
              <bc-icon name="diagram-3" /> {{ 'topics.prerequisite' | t: { count: topic.prerequisites.length } }}
              @for (p of topic.prerequisites; track p.id) {
                <a [routerLink]="['/topics', p.id]">{{ p.title | loc }}</a>{{ $last ? '' : i18n.listSeparator() }}
              }
            </p>
          }
          @if (topic.unlocks.length) {
            <p class="bc-topic__line mb-0">
              <bc-icon name="unlock" /> {{ 'topic.unlocks' | t }}
              @for (u of topic.unlocks; track u.id) {
                <a [routerLink]="['/topics', u.id]">{{ u.title | loc }}</a>{{ $last ? '' : i18n.listSeparator() }}
              }
            </p>
          }
        </div>
      </header>

      <div class="bc-toolbar">
        <nav class="bc-toc" [attr.aria-label]="'topic.sections' | t">
          @for (s of sections; track s) {
            <a [routerLink]="[]" [fragment]="s">{{ 'topic.sec.' + s | t }}</a>
          }
        </nav>
        <div class="bc-seg" role="group" [attr.aria-label]="'topic.contentLang' | t">
          <button type="button" lang="ar" [class.is-on]="i18n.contentLang() === 'ar'" [attr.aria-pressed]="i18n.contentLang() === 'ar'" (click)="i18n.setContentLang('ar')">العربية</button>
          <button type="button" lang="en" [class.is-on]="i18n.contentLang() === 'en'" [attr.aria-pressed]="i18n.contentLang() === 'en'" (click)="i18n.setContentLang('en')">English</button>
        </div>
      </div>

      <!-- Content follows the *content* language; the interface around it follows the UI language. -->
      <div class="bc-content" [attr.lang]="i18n.contentLang()" [attr.dir]="i18n.contentLang() === 'ar' ? 'rtl' : 'ltr'">
        <section id="lesson" class="bc-sec" aria-labelledby="lesson-h">
          <h2 id="lesson-h"><span [attr.dir]="i18n.dir()" [attr.lang]="i18n.lang()">{{ 'topic.sec.lesson' | t }}</span></h2>
          @for (l of d.content.lessons; track l.id) {
            <h3 class="bc-h-md">{{ l.title | cloc }}</h3>
            <bc-markdown [source]="l.bodyMarkdown | cloc" />
          }
        </section>

        <section id="examples" class="bc-sec" aria-labelledby="examples-h">
          <h2 id="examples-h"><span [attr.dir]="i18n.dir()" [attr.lang]="i18n.lang()">{{ 'topic.sec.examples' | t }}</span></h2>
          @for (ex of d.content.codeExamples; track ex.id) {
            <article class="bc-example">
              <h3 class="bc-h-md">{{ ex.title | cloc }}</h3>
              <p class="text-body-secondary">{{ ex.description | cloc }}</p>
              <bc-code-block [code]="ex.pythonCode" [output]="ex.expectedOutput" />
              <p class="mt-2 mb-0">{{ ex.explanation | cloc }}</p>
            </article>
          }
        </section>

        <section id="worked" class="bc-sec" aria-labelledby="worked-h">
          <h2 id="worked-h"><span [attr.dir]="i18n.dir()" [attr.lang]="i18n.lang()">{{ 'topic.sec.worked' | t }}</span></h2>
          @for (w of d.content.workedProblems; track w.id) {
            <article class="bc-worked">
              <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                <h3 class="bc-h-md mb-0">{{ w.title | cloc }}</h3>
                <span class="bc-chip" [attr.data-level]="w.difficulty" [attr.dir]="i18n.dir()" [attr.lang]="i18n.lang()">{{ 'difficulty.' + w.difficulty | t }}</span>
              </div>
              <h4 class="bc-h-sm"><span [attr.dir]="i18n.dir()" [attr.lang]="i18n.lang()">{{ 'worked.problem' | t }}</span></h4>
              <p>{{ w.statement | cloc }}</p>
              <h4 class="bc-h-sm"><span [attr.dir]="i18n.dir()" [attr.lang]="i18n.lang()">{{ 'worked.idea' | t }}</span></h4>
              <p>{{ w.approach | cloc }}</p>

              @if (isOpen(w)) {
                <h4 class="bc-h-sm"><span [attr.dir]="i18n.dir()" [attr.lang]="i18n.lang()">{{ 'worked.solution' | t }}</span></h4>
                <bc-code-block [code]="w.pythonSolution" />
                <p class="mt-2">{{ w.solutionExplanation | cloc }}</p>
                <p class="mb-2"><strong [attr.dir]="i18n.dir()" [attr.lang]="i18n.lang()">{{ 'worked.complexity' | t }}:</strong> <code dir="ltr">{{ w.complexity }}</code></p>
                <button type="button" class="btn btn-outline-dark btn-sm" (click)="toggle(w)" [attr.dir]="i18n.dir()">{{ 'worked.hide' | t }}</button>
              } @else {
                <button type="button" class="btn btn-outline-dark" (click)="toggle(w)" [attr.dir]="i18n.dir()">
                  <bc-icon name="lightbulb" /> {{ 'worked.show' | t }}
                </button>
              }
            </article>
          }
        </section>
      </div>

      <section id="practice" class="bc-sec" aria-labelledby="practice-h">
        <h2 id="practice-h">{{ 'topic.sec.practice' | t }}</h2>
        <p class="text-body-secondary">{{ 'practice.intro' | t }}</p>
        <ol class="bc-problems">
          @for (p of d.problems; track p.id) {
            <li>
              <span class="bc-problems__id" dir="ltr">{{ p.contestId }}{{ p.index }}</span>
              <span class="bc-problems__main">
                <strong dir="ltr">{{ p.name }}</strong>
                <small class="d-block text-body-secondary" dir="ltr">
                  @if (p.rating) { ★ {{ p.rating }} · }
                  {{ p.tags.join(', ') }}
                </small>
              </span>
              @if (p.solved === true) {
                <span class="bc-chip" data-level="done"><bc-icon name="check-circle-fill" /> {{ 'practice.solved' | t }}</span>
              } @else if (p.solved === false) {
                <span class="bc-chip" data-level="todo">{{ 'practice.unsolved' | t }}</span>
              }
              <a class="btn btn-outline-dark btn-sm" [href]="p.url" target="_blank" rel="noopener noreferrer">
                {{ 'practice.open' | t }} <bc-icon name="box-arrow-up-right" />
              </a>
            </li>
          }
        </ol>
        @if (auth.user()?.codeforcesHandle === null) {
          <p class="bc-callout mt-3">
            <bc-icon name="link-45deg" />
            <span>{{ 'practice.connectHint' | t }} <a routerLink="/profile">{{ 'practice.connectLink' | t }}</a></span>
          </p>
        }
      </section>

      <section id="quiz" class="bc-sec" aria-labelledby="quiz-h">
        <h2 id="quiz-h">{{ 'topic.sec.quiz' | t }}</h2>
        @if (topic.quiz; as q) {
          <div class="bc-quiz-card">
            <div>
              <p class="mb-1"><strong>{{ 'quiz.questions' | t: { count: q.questionCount } }}</strong></p>
              @if (q.attemptsCount) {
                <p class="text-body-secondary mb-0">
                  {{ 'quiz.attempts' | t: { count: q.attemptsCount } }} ·
                  {{ 'quiz.latest' | t }}: <strong>{{ q.latestScore }}%</strong> ·
                  {{ 'quiz.best' | t }}: <strong>{{ q.bestScore }}%</strong>
                </p>
              } @else {
                <p class="text-body-secondary mb-0">{{ 'quiz.noAttempts' | t }}</p>
              }
            </div>
            <div class="d-flex flex-wrap gap-2">
              <a class="btn btn-primary" [routerLink]="['/quiz', q.id]">{{ (q.attemptsCount ? 'quiz.retake' : 'quiz.start') | t }}</a>
              @if (q.attemptsCount) {
                <a class="btn btn-outline-dark" routerLink="/attempts" [queryParams]="{ topic: topic.id }">{{ 'nav.history' | t }}</a>
              }
            </div>
          </div>
        }
      </section>
    } @else {
      <bc-loading />
    }
  `,
})
export class TopicPage {
  private readonly api = inject(BaccaApi);
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(Auth);
  protected readonly i18n = inject(I18n);

  /** Bound from the :id route parameter (withComponentInputBinding). */
  readonly id = input.required<string>();
  protected readonly sections = SECTIONS;
  private readonly opened = signal<ReadonlySet<number>>(new Set());
  private readonly fragment = toSignal(this.route.fragment, { initialValue: null });

  protected readonly data = rxResource({
    params: () => Number(this.id()),
    stream: ({ params: id }) =>
      forkJoin({
        topic: this.api.getTopic(id),
        content: this.api.getTopicContent(id),
        problems: this.api.getTopicProblems(id),
      }),
  });

  constructor() {
    // Deep links such as /topics/5#practice scroll once the content has rendered.
    effect(() => {
      const fragment = this.fragment();
      if (!this.data.hasValue()) return;
      setTimeout(() => {
        const el = fragment ? document.getElementById(fragment) : null;
        if (el) {
          const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
          el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
          el.focus?.({ preventScroll: true });
        }
      });
    });
  }

  protected isOpen(w: WorkedProblemDto): boolean {
    return this.opened().has(w.id);
  }

  protected toggle(w: WorkedProblemDto): void {
    this.opened.update((s) => {
      const next = new Set(s);
      if (!next.delete(w.id)) next.add(w.id);
      return next;
    });
  }
}
