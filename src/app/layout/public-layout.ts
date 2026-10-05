import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from '../core/auth/auth';
import { I18N_PIPES } from '../core/i18n/i18n';
import { Brand } from './brand';
import { LangToggle } from './lang-toggle';

/** Layout for the home, login and register pages. */
@Component({
  selector: 'bc-public-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, Brand, LangToggle, ...I18N_PIPES],
  template: `
    <a class="bc-skip" href="#main">{{ 'common.skip' | t }}</a>
    <header class="bc-topbar bc-topbar--public">
      <bc-brand />
      <span class="flex-grow-1"></span>
      <bc-lang-toggle />
      @if (auth.isSignedIn()) {
        <a routerLink="/dashboard" class="btn btn-primary btn-sm">{{ 'nav.dashboard' | t }}</a>
      } @else {
        <a routerLink="/login" class="btn btn-outline-dark btn-sm d-none d-sm-inline-block">{{ 'auth.signIn' | t }}</a>
        <a routerLink="/register" class="btn btn-primary btn-sm">{{ 'auth.createAccount' | t }}</a>
      }
    </header>
    <main id="main" tabindex="-1"><router-outlet /></main>
    <footer class="bc-footer">
      <p class="mb-1">{{ 'footer.about' | t }}</p>
      <p class="mb-0 text-body-secondary">{{ 'footer.data' | t }}</p>
    </footer>
  `,
})
export class PublicLayout {
  protected readonly auth = inject(Auth);
}
