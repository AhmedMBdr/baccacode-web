import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BaccaApi } from '../core/api/baccacode-api';
import { I18N_PIPES } from '../core/i18n/i18n';
import { ErrorState, Loading } from '../shared/status';

const PAGE_SIZE = 10;

/** Quiz history (spec 10.11): every attempt is kept, so improvement is visible. Paged (spec 22.1). */
@Component({
  selector: 'bc-attempts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Loading, ErrorState, ...I18N_PIPES],
  template: `
    <h1 class="bc-page-title">{{ 'history.title' | t }}</h1>

    @if (data.error()) {
      <bc-error [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.hasValue()) {
      @let d = data.value();
      @if (topic()) {
        <p class="bc-callout">
          {{ 'history.filtered' | t }}
          <a routerLink="/attempts">{{ 'history.clearFilter' | t }}</a>
        </p>
      }
      @if (d.items.length) {
        <div class="table-responsive">
          <table class="table bc-table align-middle">
            <caption class="visually-hidden">{{ 'history.title' | t }}</caption>
            <thead>
              <tr>
                <th scope="col">{{ 'history.quiz' | t }}</th>
                <th scope="col">{{ 'history.attempt' | t }}</th>
                <th scope="col">{{ 'history.score' | t }}</th>
                <th scope="col">{{ 'history.date' | t }}</th>
                <th scope="col"><span class="visually-hidden">{{ 'quiz.reviewAnswers' | t }}</span></th>
              </tr>
            </thead>
            <tbody>
              @for (a of d.items; track a.attemptId) {
                <tr>
                  <th scope="row" class="fw-semibold">{{ a.quizTitle | loc }}</th>
                  <td>#{{ a.attemptNumber }}</td>
                  <td><span class="bc-score" [attr.data-band]="a.score >= 85 ? 'high' : a.score >= 70 ? 'mid' : 'low'">{{ a.score }}%</span>
                    <small class="text-body-secondary ms-2">{{ a.correctCount }}/{{ a.correctCount + a.wrongCount + a.skippedCount }}</small></td>
                  <td>{{ a.submittedAt | bcDate }}</td>
                  <td class="text-end"><a [routerLink]="['/attempts', a.attemptId]">{{ 'quiz.reviewAnswers' | t }}</a></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (pages() > 1) {
          <nav class="d-flex align-items-center justify-content-between" [attr.aria-label]="'history.pages' | t">
            <button type="button" class="btn btn-outline-dark btn-sm" [disabled]="page() === 1" (click)="page.set(page() - 1)">{{ 'common.previous' | t }}</button>
            <span class="text-body-secondary">{{ 'history.pageOf' | t: { page: page(), pages: pages() } }}</span>
            <button type="button" class="btn btn-outline-dark btn-sm" [disabled]="page() >= pages()" (click)="page.set(page() + 1)">{{ 'common.next' | t }}</button>
          </nav>
        }
      } @else {
        <div class="bc-empty">
          <p>{{ 'history.empty' | t }}</p>
          <a class="btn btn-primary" routerLink="/topics">{{ 'nav.topics' | t }}</a>
        </div>
      }
    } @else {
      <bc-loading />
    }
  `,
})
export class AttemptsPage {
  private readonly api = inject(BaccaApi);
  /** Optional ?topic= filter, bound from the query string. */
  readonly topic = input<string | undefined>(undefined);
  protected readonly page = signal(1);

  protected readonly data = rxResource({
    params: () => ({ page: this.page(), topicId: this.topic() ? Number(this.topic()) : undefined }),
    stream: ({ params }) => this.api.getAttempts({ page: params.page, pageSize: PAGE_SIZE, topicId: params.topicId }),
  });

  protected readonly pages = computed(() =>
    this.data.hasValue() ? Math.max(1, Math.ceil(this.data.value().totalCount / PAGE_SIZE)) : 1,
  );
}
