import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BaccaApi } from '../core/api/baccacode-api';
import { Auth } from '../core/auth/auth';
import { I18n, I18N_PIPES } from '../core/i18n/i18n';
import { Icon } from '../shared/icon';
import { Mastery, StatusChip } from '../shared/mastery';
import { Reasons } from '../shared/reasons';
import { ErrorState, Loading } from '../shared/status';

/** Topic browser (spec 10.3): every topic with mastery, prerequisite and the same "why" the study plan uses. */
@Component({
  selector: 'bc-topics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Mastery, StatusChip, Reasons, Loading, ErrorState, ...I18N_PIPES],
  template: `
    <header class="bc-page-head">
      <h1 class="bc-page-title">{{ 'topics.title' | t }}</h1>
      <p class="text-body-secondary mb-0">{{ 'topics.curriculum' | t: { version: auth.user()?.curriculumVersion ?? '' } }}</p>
    </header>

    @if (data.error()) {
      <bc-error [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.hasValue()) {
      <ol class="bc-roadmap">
        @for (t of data.value().topics; track t.id) {
          <li class="bc-topic" [class.is-next]="t.id === nextId()" [attr.data-status]="t.status">
            <span class="bc-topic__num" aria-hidden="true">{{ t.number < 10 ? '0' + t.number : t.number }}</span>
            <div class="bc-topic__body">
              @if (t.id === nextId()) { <p class="bc-marker">{{ 'topics.recommendedNext' | t }}</p> }
              <h2 class="bc-topic__title"><a [routerLink]="['/topics', t.id]">{{ t.title | loc }}</a></h2>
              <p class="bc-topic__summary">{{ t.summary | loc }}</p>

              <div class="bc-topic__status">
                <bc-mastery [value]="t.masteryScore" />
                <bc-status [status]="t.status" />
              </div>

              @if (t.prerequisites.length) {
                <p class="bc-topic__line">
                  <bc-icon name="diagram-3" />
                  {{ 'topics.prerequisite' | t: { count: t.prerequisites.length } }}
                  @for (p of t.prerequisites; track p.id) {
                    <a [routerLink]="['/topics', p.id]">{{ p.title | loc }}</a>{{ $last ? '' : i18n.listSeparator() }}
                  }
                </p>
              }
              @if (t.reasons.length) {
                <div class="bc-topic__why">
                  <span class="bc-topic__why-label">{{ 'topics.why' | t }}</span>
                  <bc-reasons [reasons]="t.reasons" />
                </div>
              }
              <p class="bc-topic__meta">
                <span><bc-icon name="stopwatch" /> {{ 'topics.minutes' | t: { count: t.estimatedMinutes } }}</span>
                @if (auth.user()?.codeforcesHandle) {
                  <span><bc-icon name="terminal" /> {{ 'topics.solved' | t: { solved: t.solvedProblemCount, total: t.problemCount } }}</span>
                } @else {
                  <span><bc-icon name="terminal" /> {{ 'topics.problems' | t: { count: t.problemCount } }}</span>
                }
              </p>
            </div>
            <a class="btn btn-sm bc-topic__go" [class.btn-primary]="t.id === nextId()" [class.btn-outline-dark]="t.id !== nextId()" [routerLink]="['/topics', t.id]">
              {{ (t.masteryScore === null ? 'topics.start' : 'topics.continue') | t }}
            </a>
          </li>
        }
      </ol>
    } @else {
      <bc-loading />
    }
  `,
})
export class TopicsPage {
  private readonly api = inject(BaccaApi);
  protected readonly auth = inject(Auth);
  protected readonly i18n = inject(I18n);

  protected readonly data = rxResource({
    stream: () => forkJoin({ topics: this.api.getTopics(), plan: this.api.getStudyPlan() }),
  });

  /** The topic the study plan puts first right now. */
  protected readonly nextId = computed(() =>
    this.data.hasValue() ? (this.data.value().plan.items.find((i) => i.status === 'Pending')?.topicId ?? null) : null,
  );
}
