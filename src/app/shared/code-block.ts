import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { I18n, I18N_PIPES } from '../core/i18n/i18n';
import { highlightPython } from './highlight';
import { Icon } from './icon';

/**
 * Python code is always left-to-right, even inside an Arabic page (spec 16.4).
 * Optional expected output is shown in its own panel under the code.
 */
@Component({
  selector: 'bc-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, ...I18N_PIPES],
  template: `
    <figure class="bc-code">
      <div class="bc-code__bar">
        <span class="bc-code__lang">Python</span>
        <button type="button" class="bc-code__copy" (click)="copy()">
          <bc-icon [name]="copied() ? 'check2' : 'clipboard'" />
          {{ (copied() ? 'code.copied' : 'code.copy') | t }}
        </button>
      </div>
      <pre dir="ltr" tabindex="0"><code [innerHTML]="html()"></code></pre>
      @if (output() !== null && output() !== undefined) {
        <figcaption class="bc-code__out" dir="ltr">
          <span class="bc-code__out-label" [attr.dir]="i18n.dir()">{{ 'code.output' | t }}</span>
          <pre>{{ output() }}</pre>
        </figcaption>
      }
    </figure>
  `,
})
export class CodeBlock {
  protected readonly i18n = inject(I18n);
  readonly code = input.required<string>();
  readonly output = input<string | null>(null);
  protected readonly copied = signal(false);
  protected readonly html = computed(() => highlightPython(this.code()));

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    } catch {
      /* Clipboard blocked (e.g. insecure context): the code stays selectable. */
    }
  }
}
