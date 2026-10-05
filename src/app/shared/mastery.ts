import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { I18N_PIPES } from '../core/i18n/i18n';
import { MasteryStatus } from '../core/models';

/** Mastery bar. null means "not assessed" — shown as such, never as 0% (spec 12.2). */
@Component({
  selector: 'bc-mastery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...I18N_PIPES],
  template: `
    <div class="bc-meter" [attr.data-status]="status()">
      @if (value() === null) {
        <span class="bc-meter__text" aria-hidden="true">—</span>
        <span class="bc-meter__track" aria-hidden="true"></span>
      } @else {
        <span class="bc-meter__text"><strong>{{ value() }}%</strong></span>
        <span
          class="bc-meter__track"
          role="progressbar"
          [attr.aria-label]="'mastery.label' | t"
          aria-valuemin="0"
          aria-valuemax="100"
          [attr.aria-valuenow]="value()"
        >
          <span class="bc-meter__fill" [style.inline-size.%]="value()"></span>
        </span>
      }
    </div>
  `,
})
export class Mastery {
  readonly value = input<number | null>(null);
  protected readonly status = computed<MasteryStatus>(() => {
    const v = this.value();
    if (v === null) return 'NotAssessed';
    return v >= 85 ? 'Mastered' : v >= 70 ? 'Developing' : 'NeedsReview';
  });
}

@Component({
  selector: 'bc-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...I18N_PIPES],
  template: `<span class="bc-status" [attr.data-status]="status()">{{ 'status.' + status() | t }}</span>`,
})
export class StatusChip {
  readonly status = input.required<MasteryStatus>();
}
