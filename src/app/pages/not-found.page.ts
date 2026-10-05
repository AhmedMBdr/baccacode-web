import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18N_PIPES } from '../core/i18n/i18n';

@Component({
  selector: 'bc-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ...I18N_PIPES],
  template: `
    <section class="bc-auth text-center">
      <h1>{{ 'nf.title' | t }}</h1>
      <p>{{ 'nf.text' | t }}</p>
      <a routerLink="/" class="btn btn-primary">{{ 'nf.home' | t }}</a>
    </section>
  `,
})
export class NotFoundPage {}
