import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18N_PIPES, I18n } from '../core/i18n/i18n';
import { ActionCode, PlanAction, Reason } from '../core/models';
import { Icon } from './icon';

const REASON_ICON: Record<string, string> = {
  LOW_MASTERY: 'graph-down-arrow',
  OPEN_MISTAKES: 'x-circle',
  PREREQUISITE_FOR: 'diagram-3',
  NOT_REVIEWED_RECENTLY: 'clock-history',
  NOT_STARTED: 'play-circle',
  PRACTICE_INCOMPLETE: 'terminal',
};

/** The "Why" line shared by the topic browser, the dashboard and the study plan (spec 10.3). */
@Component({
  selector: 'bc-reasons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, ...I18N_PIPES],
  template: `
    @if (reasons().length) {
      <ul class="bc-reasons">
        @for (r of reasons(); track r.code) {
          <li>
            <bc-icon [name]="icon(r.code)" />
            {{ 'reason.' + r.code | t: { count: r.value ?? 0 } }}
          </li>
        }
      </ul>
    }
  `,
})
export class Reasons {
  readonly reasons = input.required<Reason[]>();
  protected icon(code: string): string {
    return REASON_ICON[code] ?? 'info-circle';
  }
}

const FRAGMENT: Partial<Record<ActionCode, string>> = {
  REVIEW_LESSON: 'lesson',
  REVIEW_EXAMPLES: 'examples',
  WORKED_PROBLEM: 'worked',
  SOLVE_PROBLEMS: 'practice',
};

/** Recommended actions as an ordered list; each step links to where it is done. */
@Component({
  selector: 'bc-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <ol class="bc-actions">
      @for (a of actions(); track a.code) {
        <li [class.is-optional]="a.optional">
          @switch (a.code) {
            @case ('REVIEW_MISTAKES') {
              <a routerLink="/mistakes" [queryParams]="{ topic: topicId() }">{{ label(a) }}</a>
            }
            @case ('TAKE_QUIZ') {
              <a [routerLink]="quizId() ? ['/quiz', quizId()] : ['/topics', topicId()]">{{ label(a) }}</a>
            }
            @case ('RETAKE_QUIZ') {
              <a [routerLink]="quizId() ? ['/quiz', quizId()] : ['/topics', topicId()]">{{ label(a) }}</a>
            }
            @case ('CONTINUE_NEXT') {
              <a routerLink="/topics">{{ label(a) }}</a>
            }
            @default {
              <a [routerLink]="['/topics', topicId()]" [fragment]="fragment(a.code)">{{ label(a) }}</a>
            }
          }
        </li>
      }
    </ol>
  `,
})
export class Actions {
  private readonly i18n = inject(I18n);
  readonly actions = input.required<PlanAction[]>();
  readonly topicId = input.required<number>();
  readonly quizId = input<number | null>(null);

  protected fragment(code: ActionCode): string | undefined {
    return FRAGMENT[code];
  }

  protected label(a: PlanAction): string {
    const text = this.i18n.t(`action.${a.code}`, { count: a.count ?? 1 });
    return a.optional ? `${text} (${this.i18n.t('action.optional')})` : text;
  }
}
