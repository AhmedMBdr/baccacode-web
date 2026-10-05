import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BaccaApi } from '../core/api/baccacode-api';
import { I18N_PIPES } from '../core/i18n/i18n';
import { Icon } from '../shared/icon';
import { Mastery } from '../shared/mastery';

@Component({
  selector: 'bc-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Mastery, ...I18N_PIPES],
  template: `
    <section class="bc-hero">
      <div class="bc-hero__copy">
        <h1>{{ 'home.title' | t }}</h1>
        <p class="bc-lead">{{ 'home.lead' | t }}</p>
        <div class="d-flex flex-wrap gap-2">
          <a routerLink="/register" class="btn btn-primary btn-lg">{{ 'auth.createAccount' | t }}</a>
          <a routerLink="/login" class="btn btn-outline-dark btn-lg">{{ 'auth.signIn' | t }}</a>
        </div>
      </div>

      <!-- A real sample of what the product produces, not decoration. -->
      <aside class="bc-sample" [attr.aria-label]="'home.sampleLabel' | t">
        <p class="bc-sample__tag">{{ 'home.sampleTag' | t }}</p>
        <div class="bc-sample__head">
          <h2>{{ 'home.sampleTopic' | t }}</h2>
          <span class="bc-priority" [attr.aria-label]="'plan.priority' | t">91</span>
        </div>
        <bc-mastery [value]="42" />
        <ul class="bc-reasons mt-3">
          <li><bc-icon name="graph-down-arrow" /> {{ 'reason.LOW_MASTERY' | t: { count: 42 } }}</li>
          <li><bc-icon name="x-circle" /> {{ 'reason.OPEN_MISTAKES' | t: { count: 4 } }}</li>
          <li><bc-icon name="diagram-3" /> {{ 'reason.PREREQUISITE_FOR' | t: { count: 2 } }}</li>
        </ul>
        <ol class="bc-actions">
          <li>{{ 'action.REVIEW_MISTAKES' | t: { count: 1 } }}</li>
          <li>{{ 'action.SOLVE_PROBLEMS' | t: { count: 2 } }}</li>
          <li>{{ 'action.RETAKE_QUIZ' | t: { count: 1 } }}</li>
        </ol>
      </aside>
    </section>

    <section class="bc-section" aria-labelledby="how-h">
      <h2 id="how-h">{{ 'home.howTitle' | t }}</h2>
      <ol class="bc-steps">
        @for (s of steps; track s) {
          <li>
            <strong>{{ 'home.step.' + s | t }}</strong>
            <span>{{ 'home.step.' + s + '.text' | t }}</span>
          </li>
        }
      </ol>
    </section>

    <section class="bc-section" aria-labelledby="topics-h">
      <h2 id="topics-h">{{ 'home.topicsTitle' | t }}</h2>
      @if (topics.hasValue()) {
        <ul class="bc-topic-preview">
          @for (t of topics.value(); track t.id) {
            <li>
              <span class="bc-num" aria-hidden="true">{{ t.number < 10 ? '0' + t.number : t.number }}</span>
              <span>
                <strong>{{ t.title | loc }}</strong>
                <small class="d-block text-body-secondary">{{ t.summary | loc }}</small>
              </span>
            </li>
          }
        </ul>
      } @else if (topics.isLoading()) {
        <span class="bc-skeleton d-block" style="block-size: 12rem"></span>
      }
    </section>

    <section class="bc-section bc-why" aria-labelledby="why-h">
      <h2 id="why-h">{{ 'home.whyTitle' | t }}</h2>
      <p>{{ 'home.why1' | t }}</p>
      <p class="mb-0">{{ 'home.why2' | t }}</p>
    </section>
  `,
})
export class HomePage {
  private readonly api = inject(BaccaApi);
  protected readonly steps = ['learn', 'practice', 'quiz', 'mistakes', 'next'] as const;
  protected readonly topics = rxResource({ stream: () => this.api.getTopics() });
}
