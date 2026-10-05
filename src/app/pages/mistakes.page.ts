import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BaccaApi } from '../core/api/baccacode-api';
import { I18N_PIPES } from '../core/i18n/i18n';
import { CodeBlock } from '../shared/code-block';
import { Icon } from '../shared/icon';
import { ErrorState, Loading } from '../shared/status';

/** Mistake bank (spec 10.12): wrong answers grouped by topic; open one for the full explanation. */
@Component({
  selector: 'bc-mistakes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, CodeBlock, Loading, ErrorState, ...I18N_PIPES],
  template: `
    <header class="bc-page-head">
      <h1 class="bc-page-title">{{ 'mistakes.title' | t }}</h1>
      <p class="text-body-secondary mb-0">{{ 'mistakes.lead' | t }}</p>
    </header>

    @if (data.error()) {
      <bc-error [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.hasValue()) {
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div class="form-check form-switch mb-0">
          <input id="showResolved" class="form-check-input" type="checkbox" role="switch" [checked]="showResolved()" (change)="showResolved.set(!showResolved())" />
          <label for="showResolved" class="form-check-label">{{ 'mistakes.showResolved' | t }}</label>
        </div>
        @if (topic()) { <a routerLink="/mistakes" class="btn btn-outline-dark btn-sm">{{ 'history.clearFilter' | t }}</a> }
      </div>

      @for (g of groups(); track g.topicId) {
        <section class="bc-mgroup" [attr.aria-labelledby]="'g' + g.topicId">
          <h2 class="bc-mgroup__head" [id]="'g' + g.topicId">
            <a [routerLink]="['/topics', g.topicId]">{{ g.topicTitle | loc }}</a>
            <span class="bc-count" [class.is-zero]="g.openCount === 0">{{ 'mistakes.open' | t: { count: g.openCount } }}</span>
          </h2>
          <ul class="bc-list">
            @for (m of g.items; track m.questionId) {
              <li class="bc-mistake" [class.is-resolved]="m.resolved">
                <button type="button" class="bc-mistake__toggle" [attr.aria-expanded]="isOpen(m.questionId)" [attr.aria-controls]="'m' + m.questionId" (click)="toggle(m.questionId)">
                  <span class="bc-mistake__q">{{ m.questionText | loc }}</span>
                  <span class="bc-mistake__meta">
                    @if (m.resolved) { <span class="bc-chip" data-level="done">{{ 'mistakes.resolved' | t }}</span> }
                    <span class="bc-chip" data-level="todo">{{ 'mistakes.times' | t: { count: m.timesMissed } }}</span>
                    <bc-icon [name]="isOpen(m.questionId) ? 'chevron-up' : 'chevron-down'" />
                  </span>
                </button>
                @if (isOpen(m.questionId)) {
                  <div class="bc-mistake__body" [id]="'m' + m.questionId">
                    @if (m.codeSnippet) { <bc-code-block [code]="m.codeSnippet" /> }
                    <dl class="bc-answers">
                      <div><dt>{{ 'review.yourAnswer' | t }}</dt><dd class="text-danger">{{ m.selectedOptionText ? (m.selectedOptionText | loc) : ('review.noAnswer' | t) }}</dd></div>
                      <div><dt>{{ 'review.correctAnswer' | t }}</dt><dd class="text-success-emphasis">{{ m.correctOptionText | loc }}</dd></div>
                    </dl>
                    <p>{{ m.explanation | loc }}</p>
                    <p class="text-body-secondary small">{{ 'mistakes.lastMissed' | t }}: {{ m.lastMissedAt | bcDate }}</p>
                    <div class="d-flex flex-wrap gap-2">
                      <a class="btn btn-outline-dark btn-sm" [routerLink]="['/topics', m.topicId]" fragment="lesson">{{ 'action.REVIEW_LESSON' | t: { count: 1 } }}</a>
                      <a class="btn btn-primary btn-sm" [routerLink]="['/quiz', m.quizId]">{{ 'quiz.retake' | t }}</a>
                    </div>
                  </div>
                }
              </li>
            }
          </ul>
        </section>
      } @empty {
        <div class="bc-empty">
          <p>{{ (data.value().length ? 'mistakes.noneOpen' : 'mistakes.empty') | t }}</p>
          <a class="btn btn-primary" routerLink="/topics">{{ 'nav.topics' | t }}</a>
        </div>
      }
    } @else {
      <bc-loading />
    }
  `,
})
export class MistakesPage {
  private readonly api = inject(BaccaApi);
  /** Optional ?topic= filter (links from the study plan use it). */
  readonly topic = input<string | undefined>(undefined);
  protected readonly showResolved = signal(false);
  private readonly expanded = signal<ReadonlySet<number>>(new Set());

  protected readonly data = rxResource({
    // An object (never a bare undefined): undefined params would leave the resource idle.
    params: () => ({ topicId: this.topic() ? Number(this.topic()) : undefined }),
    stream: ({ params }) => this.api.getMistakes(params.topicId),
  });

  protected readonly groups = computed(() => {
    if (!this.data.hasValue()) return [];
    const withResolved = this.showResolved();
    return this.data
      .value()
      .map((g) => ({ ...g, items: withResolved ? g.items : g.items.filter((i) => !i.resolved) }))
      .filter((g) => g.items.length > 0);
  });

  protected isOpen(id: number): boolean {
    return this.expanded().has(id);
  }

  protected toggle(id: number): void {
    this.expanded.update((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }
}
