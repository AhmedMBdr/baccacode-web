import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bc-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="bc-brand" aria-label="BaccaCode">
      <svg class="bc-brand__mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <rect x="5" y="19" width="22" height="6" rx="2" fill="#ffd84d" />
        <path d="M13 8 8 13l5 5M19 8l5 5-5 5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -1)" />
      </svg>
      <span class="bc-brand__name" dir="ltr">BaccaCode</span>
    </a>
  `,
})
export class Brand {}
