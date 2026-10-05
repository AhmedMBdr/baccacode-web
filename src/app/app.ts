import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { I18n } from './core/i18n/i18n';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly i18n = inject(I18n);
  private firstNavigation = true;

  /** The translation key of the deepest active route. */
  private readonly titleKey = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let route = this.router.routerState.snapshot.root;
        let key: string | undefined;
        while (route) {
          key = (route.data['titleKey'] as string | undefined) ?? key;
          route = route.firstChild as typeof route;
        }
        return key ?? null;
      }),
    ),
    { initialValue: null },
  );

  constructor() {
    // Re-runs when the page changes *or* the language does.
    effect(() => {
      const key = this.titleKey();
      const page = key ? this.i18n.t(key) : '';
      this.title.setTitle(page ? `${page} · BaccaCode` : 'BaccaCode');
    });

    // After a route change, move focus to the page so keyboard and screen-reader users start at the top.
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      if (this.firstNavigation) {
        this.firstNavigation = false;
        return;
      }
      if (!e.urlAfterRedirects.includes('#')) document.getElementById('main')?.focus({ preventScroll: true });
    });
  }
}
