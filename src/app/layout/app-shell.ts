import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../core/auth/auth';
import { I18N_PIPES } from '../core/i18n/i18n';
import { Icon } from '../shared/icon';
import { ToastHost } from '../shared/status';
import { Brand } from './brand';
import { LangToggle } from './lang-toggle';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  /** Hidden from the phone tab bar to keep it at five items. */
  desktopOnly?: boolean;
}

/** Signed-in layout: top bar, sidebar (desktop) / tab bar (phones), page container. */
@Component({
  selector: 'bc-app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Brand, LangToggle, ToastHost, ...I18N_PIPES],
  template: `
    <a class="bc-skip" href="#main">{{ 'common.skip' | t }}</a>

    <header class="bc-topbar">
      <bc-brand />
      <span class="flex-grow-1"></span>
      <bc-lang-toggle />
      <a routerLink="/profile" class="bc-user" [attr.aria-label]="'nav.profile' | t">
        <span class="bc-user__avatar" aria-hidden="true">{{ initial() }}</span>
        <span class="bc-user__name d-none d-md-inline">{{ auth.user()?.fullName }}</span>
      </a>
      <!-- On phones the top bar is full; sign-out lives at the bottom of the profile page instead. -->
      <button type="button" class="btn btn-outline-dark btn-sm bc-signout d-none d-sm-inline-flex" (click)="signOut()">
        <bc-icon name="box-arrow-right" />
        <span class="d-none d-md-inline">{{ 'nav.signOut' | t }}</span>
        <span class="visually-hidden d-md-none">{{ 'nav.signOut' | t }}</span>
      </button>
    </header>

    <div class="bc-shell">
      <nav class="bc-side" [attr.aria-label]="'nav.main' | t">
        @for (item of items; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="is-active"
            [class.bc-side__desktop-only]="item.desktopOnly"
            #rla="routerLinkActive"
            [attr.aria-current]="rla.isActive ? 'page' : null"
          >
            <bc-icon [name]="item.icon" />
            <span>{{ item.label | t }}</span>
          </a>
        }
      </nav>
      <main id="main" class="bc-main" tabindex="-1">
        <router-outlet />
      </main>
    </div>

    <bc-toasts />
  `,
})
export class AppShell {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly items: NavItem[] = [
    { path: '/dashboard', icon: 'house-door', label: 'nav.dashboard' },
    { path: '/topics', icon: 'journal-code', label: 'nav.topics' },
    { path: '/study-plan', icon: 'list-check', label: 'nav.studyPlan' },
    { path: '/mistakes', icon: 'x-octagon', label: 'nav.mistakes' },
    { path: '/attempts', icon: 'clock-history', label: 'nav.history', desktopOnly: true },
    { path: '/profile', icon: 'person-circle', label: 'nav.profile' },
  ];

  protected initial(): string {
    return (this.auth.user()?.fullName.trim()[0] ?? '?').toUpperCase();
  }

  protected signOut(): void {
    this.auth.logout().subscribe(() => void this.router.navigate(['/']));
  }
}
