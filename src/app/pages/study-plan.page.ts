import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BaccaApi } from '../core/api/baccacode-api';
import { I18n, I18N_PIPES } from '../core/i18n/i18n';
import { StudyPlanItemDto } from '../core/models';
import { ToastService } from '../core/toast';
import { Icon } from '../shared/icon';
import { Mastery } from '../shared/mastery';
import { Actions, Reasons } from '../shared/reasons';
import { ErrorState, Loading } from '../shared/status';

/** Ranked study plan (spec 11): what to do, in order, and why. */
@Component({
  selector: 'bc-study-plan-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Mastery, Reasons, Actions, Loading, ErrorState, ...I18N_PIPES],
  template: `
    <header class="bc-page-head d-flex flex-wrap justify-content-between align-items-start gap-3">
      <div>
        <h1 class="bc-page-title">{{ 'plan.title' | t }}</h1>
        <p class="text-body-secondary mb-0">{{ 'plan.lead' | t }}</p>
      </div>
      <button type="button" class="btn btn-outline-dark" [disabled]="recalculating()" (click)="recalculate()">
        @if (recalculating()) { <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> } @else { <bc-icon name="arrow-repeat" /> }
        {{ 'plan.recalculate' | t }}
      </button>
    </header>

    @if (data.error()) {
      <bc-error [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.hasValue()) {
      @if (data.value().items.length) {
        <ol class="bc-plan">
          @for (item of data.value().items; track item.id; let i = $index) {
            <li class="bc-plan__item" [class.is-done]="item.status === 'Completed'">
              <div class="bc-plan__rank" aria-hidden="true">{{ i + 1 }}</div>
              <div class="bc-plan__body">
                <div class="d-flex flex-wrap align-items-baseline justify-content-between gap-2">
                  <h2 class="bc-h-lg mb-0"><a [routerLink]="['/topics', item.topicId]">{{ item.topicTitle | loc }}</a></h2>
                  <span class="bc-priority" [attr.title]="'plan.priorityHelp' | t">
                    <span class="visually-hidden">{{ 'plan.priority' | t }}</span>{{ item.priority }}
                  </span>
                </div>
                <bc-mastery [value]="item.masteryScore" />
                <bc-reasons [reasons]="item.reasons" />

                <bc-actions [actions]="item.actions" [topicId]="item.topicId" [quizId]="item.quizId" />

                <div class="bc-plan__foot">
                  <span class="text-body-secondary">
                    <bc-icon name="stopwatch" /> {{ 'topics.minutes' | t: { count: item.estimatedMinutes } }}
                    @if (item.dueAt) { · {{ 'plan.due' | t }}: {{ dueText(item.dueAt) }} }
                  </span>
                  @if (item.status === 'Completed') {
                    <span class="bc-chip" data-level="done"><bc-icon name="check-circle-fill" /> {{ 'plan.done' | t }}</span>
                  } @else {
                    <button type="button" class="btn btn-outline-dark btn-sm" [disabled]="busyId() === item.id" (click)="complete(item)">
                      {{ 'plan.markDone' | t }}
                    </button>
                  }
                </div>
              </div>
            </li>
          }
        </ol>
      } @else {
        <div class="bc-empty">
          <p>{{ 'plan.empty' | t }}</p>
          <a class="btn btn-primary" routerLink="/topics">{{ 'nav.topics' | t }}</a>
        </div>
      }

      <details class="bc-explain">
        <summary>{{ 'plan.howTitle' | t }}</summary>
        <p>{{ 'plan.howIntro' | t }}</p>
        <dl class="bc-weights">
          @for (w of weights; track w.key) {
            <div><dt>{{ 'plan.w.' + w.key | t }}</dt><dd>{{ w.pct }}%</dd></div>
          }
        </dl>
        <p class="mb-0 text-body-secondary">{{ 'plan.howNote' | t }}</p>
      </details>
    } @else {
      <bc-loading />
    }
  `,
})
export class StudyPlanPage {
  private readonly api = inject(BaccaApi);
  private readonly i18n = inject(I18n);
  private readonly toast = inject(ToastService);

  protected readonly weights = [
    { key: 'weakness', pct: 40 },
    { key: 'recency', pct: 20 },
    { key: 'repetition', pct: 15 },
    { key: 'prerequisite', pct: 15 },
    { key: 'incompleteness', pct: 10 },
  ] as const;

  protected readonly busyId = signal<number | null>(null);
  protected readonly recalculating = signal(false);

  protected readonly data = rxResource({ stream: () => this.api.getStudyPlan() });

  protected dueText(iso: string): string {
    return this.i18n.inDays(iso);
  }

  protected complete(item: StudyPlanItemDto): void {
    this.busyId.set(item.id);
    this.api.completePlanItem(item.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.show(this.i18n.t('plan.markedDone'));
        this.data.reload();
      },
      error: (e: unknown) => {
        this.busyId.set(null);
        this.toast.show(this.i18n.error(e), 'error');
      },
    });
  }

  protected recalculate(): void {
    this.recalculating.set(true);
    this.api.recalculateStudyPlan().subscribe({
      next: () => {
        this.recalculating.set(false);
        this.toast.show(this.i18n.t('plan.recalculated'));
        this.data.reload();
      },
      error: (e: unknown) => {
        this.recalculating.set(false);
        this.toast.show(this.i18n.error(e), 'error');
      },
    });
  }
}
