import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Auth } from '../core/auth/auth';
import { I18n } from '../core/i18n/i18n';
import { Lang } from '../core/models';

/** Interface language switch. When signed in it also saves the preference (spec 9.1). */
@Component({
  selector: 'bc-lang-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bc-seg" role="group" [attr.aria-label]="i18n.t('lang.label')">
      <button
        type="button"
        lang="ar"
        [class.is-on]="i18n.lang() === 'ar'"
        [attr.aria-pressed]="i18n.lang() === 'ar'"
        (click)="pick('ar')"
      >العربية</button>
      <button
        type="button"
        lang="en"
        [class.is-on]="i18n.lang() === 'en'"
        [attr.aria-pressed]="i18n.lang() === 'en'"
        (click)="pick('en')"
      >English</button>
    </div>
  `,
})
export class LangToggle {
  protected readonly i18n = inject(I18n);
  private readonly auth = inject(Auth);

  protected pick(lang: Lang): void {
    this.i18n.setLang(lang);
    if (this.auth.isSignedIn()) this.auth.updateProfile({ preferredLanguage: lang }).subscribe({ error: () => undefined });
  }
}
