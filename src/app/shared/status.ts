import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { I18N_PIPES, I18n } from '../core/i18n/i18n';
import { ToastService } from '../core/toast';
import { Icon } from './icon';

@Component({
  selector: 'bc-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...I18N_PIPES],
  template: `
    <div class="bc-loading" role="status" aria-live="polite">
      <span class="visually-hidden">{{ 'common.loading' | t }}</span>
      <span class="bc-skeleton" style="inline-size: 38%; block-size: 1.6rem"></span>
      <span class="bc-skeleton" style="inline-size: 100%; block-size: 5.5rem"></span>
      <span class="bc-skeleton" style="inline-size: 100%; block-size: 5.5rem"></span>
    </div>
  `,
})
export class Loading {}

/** Explains what went wrong and offers a retry (errors never apologise or stay vague). */
@Component({
  selector: 'bc-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, ...I18N_PIPES],
  template: `
    <div class="bc-callout bc-callout--error" role="alert">
      <bc-icon name="exclamation-octagon" />
      <div class="flex-grow-1">
        <p class="mb-0">{{ message() }}</p>
      </div>
      @if (retryable()) {
        <button type="button" class="btn btn-outline-dark btn-sm" (click)="retry.emit()">
          {{ 'common.retry' | t }}
        </button>
      }
    </div>
  `,
})
export class ErrorState {
  private readonly i18n = inject(I18n);
  readonly error = input<unknown>(null);
  readonly retryable = input(true);
  readonly retry = output<void>();
  protected readonly message = computed(() => this.i18n.error(this.error()));
}

@Component({
  selector: 'bc-toasts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, ...I18N_PIPES],
  template: `
    <div class="bc-toasts" aria-live="polite" aria-atomic="false">
      @for (t of toasts.toasts(); track t.id) {
        <div class="bc-toast" [attr.data-kind]="t.kind" role="status">
          <bc-icon [name]="t.kind === 'error' ? 'exclamation-circle' : 'check-circle'" />
          <span>{{ t.text }}</span>
          <button type="button" class="btn-close btn-sm" [attr.aria-label]="'common.close' | t" (click)="toasts.dismiss(t.id)"></button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);
}
