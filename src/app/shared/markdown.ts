import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Marked } from 'marked';
import { highlightPython } from './highlight';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Lesson Markdown → HTML (spec 10.5). Defence in depth against XSS:
 *  1. raw HTML inside the Markdown is escaped, never passed through;
 *  2. the result is bound with [innerHTML], which Angular sanitises again.
 * Fenced code is highlighted and forced left-to-right.
 */
const marked = new Marked({
  gfm: true,
  renderer: {
    html: ({ text }) => escapeHtml(text),
    code: ({ text, lang }) => {
      const body = !lang || lang === 'python' || lang === 'py' ? highlightPython(text) : escapeHtml(text);
      return `<pre dir="ltr" class="bc-md-code"><code>${body}</code></pre>`;
    },
  },
});

@Component({
  selector: 'bc-markdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="bc-md" [innerHTML]="html()"></div>`,
})
export class Markdown {
  readonly source = input.required<string>();
  protected readonly html = computed(() => marked.parse(this.source(), { async: false }));
}
