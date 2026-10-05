import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BaccaApi } from '../core/api/baccacode-api';
import { I18N_PIPES } from '../core/i18n/i18n';
import { CodeBlock } from '../shared/code-block';
import { Icon } from '../shared/icon';
import { ErrorState, Loading } from '../shared/status';

/** Read-only review of one attempt, built from the answer snapshots (spec 13.2.1). */
@Component({
  selector: 'bc-attempt-review-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, CodeBlock, Loading, ErrorState, ...I18N_PIPES],
  template: `
    <nav class="bc-crumbs" [attr.aria-label]="'common.breadcrumb' | t">
      <a routerLink="/attempts">{{ 'history.title' | t }}</a>
    </nav>

    @if (data.error()) {
      <bc-error [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.hasValue()) {
      @let d = data.value();
      <header class="bc-page-head">
        <h1 class="bc-page-title">{{ d.quizTitle | loc }} <small class="text-body-secondary">#{{ d.attemptNumber }}</small></h1>
        <p class="mb-0">
          <span class="bc-score" [attr.data-band]="d.score >= 85 ? 'high' : d.score >= 70 ? 'mid' : 'low'">{{ d.score }}%</span>
          <span class="text-body-secondary ms-2">{{ d.submittedAt | bcDate }}</span>
        </p>
      </header>

      <div class="form-check form-switch mb-3">
        <input id="onlyWrong" class="form-check-input" type="checkbox" role="switch" [checked]="onlyWrong()" (change)="onlyWrong.set(!onlyWrong())" />
        <label for="onlyWrong" class="form-check-label">{{ 'review.onlyWrong' | t }}</label>
      </div>

      <ol class="bc-review">
        @for (a of visible(); track a.questionId) {
          <li class="bc-review__item" [class.is-wrong]="!a.isCorrect">
            <p class="bc-review__q">
              <bc-icon [name]="a.isCorrect ? 'check-circle-fill' : 'x-circle-fill'" />
              {{ a.questionText | loc }}
            </p>
            @if (a.codeSnippet) { <bc-code-block [code]="a.codeSnippet" /> }
            <dl class="bc-answers">
              <div>
                <dt>{{ 'review.yourAnswer' | t }}</dt>
                <dd [class.text-danger]="!a.isCorrect">{{ a.selectedOptionText ? (a.selectedOptionText | loc) : ('review.noAnswer' | t) }}</dd>
              </div>
              @if (!a.isCorrect) {
                <div>
                  <dt>{{ 'review.correctAnswer' | t }}</dt>
                  <dd class="text-success-emphasis">{{ a.correctOptionText | loc }}</dd>
                </div>
              }
            </dl>
            <p class="bc-review__why">{{ a.explanation | loc }}</p>
          </li>
        } @empty {
          <li class="bc-empty">{{ 'review.allCorrect' | t }}</li>
        }
      </ol>
    } @else {
      <bc-loading />
    }
  `,
})
export class AttemptReviewPage {
  private readonly api = inject(BaccaApi);
  readonly id = input.required<string>();
  protected readonly onlyWrong = signal(false);

  protected readonly data = rxResource({ params: () => Number(this.id()), stream: ({ params }) => this.api.getAttempt(params) });

  protected readonly visible = computed(() => {
    if (!this.data.hasValue()) return [];
    const all = this.data.value().answers;
    return this.onlyWrong() ? all.filter((a) => !a.isCorrect) : all;
  });
}
