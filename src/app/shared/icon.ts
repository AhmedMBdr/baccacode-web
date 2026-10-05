import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Bootstrap Icons via the SVG sprite copied to /vendor (see angular.json assets). */
@Component({
  selector: 'bc-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg class="bc-icon" aria-hidden="true" focusable="false">
    <use [attr.href]="'vendor/bootstrap-icons.svg#' + name()" />
  </svg>`,
  styles: `
    :host { display: inline-flex; vertical-align: -0.125em; }
    .bc-icon { width: 1em; height: 1em; fill: currentColor; }
  `,
})
export class Icon {
  readonly name = input.required<string>();
}
