import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18N_PIPES } from '../core/i18n/i18n';
import { QuizAttemptSummaryDto, StudyPlanItemDto, TopicSummaryDto } from '../core/models';
import { Actions, Reasons } from '../shared/reasons';
import { Mastery } from '../shared/mastery';

/** One headline number (spec 10.10: overall mastery, topics completed, average score). */
@Component({
  selector: 'bc-progress-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bc-stat">
      <p class="bc-stat__label">{{ label() }}</p>
      <p class="bc-stat__value">{{ value() }}</p>
      @if (hint()) { <p class="bc-stat__hint">{{ hint() }}</p> }
    </div>
  `,
})
export class ProgressCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string>('');
}

/** The single most important thing on the dashboard: what to do next, and why. */
@Component({
  selector: 'bc-priority-topic-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Reasons, Actions, Mastery, ...I18N_PIPES],
  template: `
    <article class="bc-priority-card" aria-labelledby="prio-h">
      <p class="bc-marker">{{ 'dash.priorityTopic' | t }}</p>
      <h2 id="prio-h">{{ item().topicTitle | loc }}</h2>
      <bc-mastery [value]="item().masteryScore" />
      <bc-reasons [reasons]="item().reasons" />

      <h3 class="bc-h-sm">{{ 'dash.recommendedToday' | t }}</h3>
      <bc-actions [actions]="item().actions" [topicId]="item().topicId" [quizId]="item().quizId" />

      <div class="d-flex flex-wrap gap-2 mt-3">
        <a class="btn btn-primary" [routerLink]="['/topics', item().topicId]" fragment="lesson">{{ 'dash.reviewNow' | t }}</a>
        <a class="btn btn-outline-dark" routerLink="/study-plan">{{ 'dash.fullPlan' | t }}</a>
      </div>
    </article>
  `,
})
export class PriorityTopicCard {
  readonly item = input.required<StudyPlanItemDto>();
}

@Component({
  selector: 'bc-recent-quiz-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ...I18N_PIPES],
  template: `
    @if (attempts().length) {
      <ul class="bc-list">
        @for (a of attempts(); track a.attemptId) {
          <li>
            <a [routerLink]="['/attempts', a.attemptId]" class="bc-list__link">
              <span>
                <strong>{{ a.quizTitle | loc }}</strong>
                <small class="d-block text-body-secondary">{{ a.submittedAt | bcAgo }}</small>
              </span>
              <span class="bc-score" [attr.data-band]="band(a.score)">{{ a.score }}%</span>
            </a>
          </li>
        }
      </ul>
    } @else {
      <p class="text-body-secondary mb-0">{{ 'dash.noQuizzes' | t }}</p>
    }
  `,
})
export class RecentQuizList {
  readonly attempts = input.required<QuizAttemptSummaryDto[]>();
  protected band(score: number): string {
    return score >= 85 ? 'high' : score >= 70 ? 'mid' : 'low';
  }
}

/** A compact row of eight tiles: one per topic, filled in proportion to mastery. */
@Component({
  selector: 'bc-topic-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ...I18N_PIPES],
  template: `
    <ol class="bc-strip">
      @for (t of topics(); track t.id) {
        <li>
          <a
            [routerLink]="['/topics', t.id]"
            class="bc-tile"
            [attr.data-status]="t.status"
            [attr.aria-label]="(t.title | loc) + (t.masteryScore === null ? '' : ': ' + t.masteryScore + '%')"
          >
            <span class="bc-tile__fill" [style.block-size.%]="t.masteryScore ?? 0"></span>
            <span class="bc-tile__n">{{ t.number }}</span>
          </a>
        </li>
      }
    </ol>
  `,
})
export class TopicStrip {
  readonly topics = input.required<TopicSummaryDto[]>();
}
