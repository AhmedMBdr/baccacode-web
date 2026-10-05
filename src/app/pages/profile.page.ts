import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BaccaApi } from '../core/api/baccacode-api';
import { Auth } from '../core/auth/auth';
import { I18n, I18N_PIPES } from '../core/i18n/i18n';
import { Lang } from '../core/models';
import { ToastService } from '../core/toast';
import { Icon } from '../shared/icon';
import { ErrorState, Loading } from '../shared/status';

const HANDLE_PATTERN = /^[A-Za-z0-9_.-]{3,24}$/;

/** Account, language, Codeforces connection and quiz statistics (spec 9.11). */
@Component({
  selector: 'bc-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, Loading, ErrorState, ...I18N_PIPES],
  template: `
    <h1 class="bc-page-title">{{ 'profile.title' | t }}</h1>

    @if (data.error()) {
      <bc-error [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.hasValue()) {
      @let d = data.value();
      <div class="bc-profile">
        <section class="bc-panel" aria-labelledby="acct-h">
          <h2 id="acct-h" class="bc-h-md">{{ 'profile.account' | t }}</h2>
          <form [formGroup]="accountForm" (ngSubmit)="saveAccount()" novalidate>
            <div class="mb-3">
              <label for="name" class="form-label">{{ 'auth.fullName' | t }}</label>
              <input id="name" class="form-control" formControlName="fullName" autocomplete="name"
                [class.is-invalid]="accountForm.controls.fullName.invalid && accountForm.controls.fullName.touched" />
              <div class="invalid-feedback">{{ 'val.required' | t }}</div>
            </div>
            <div class="mb-3">
              <label for="mail" class="form-label">{{ 'auth.email' | t }}</label>
              <input id="mail" class="form-control" [value]="auth.user()?.email" readonly dir="ltr" />
            </div>
            <div class="mb-3">
              <span class="form-label d-block">{{ 'profile.curriculum' | t }}</span>
              <span dir="ltr">{{ auth.user()?.curriculumVersion }}</span>
            </div>
            <fieldset class="mb-3">
              <legend class="form-label fs-6">{{ 'auth.language' | t }}</legend>
              <div class="bc-seg bc-seg--wide">
                <label [class.is-on]="accountForm.controls.preferredLanguage.value === 'ar'">
                  <input type="radio" class="visually-hidden" formControlName="preferredLanguage" value="ar" /> العربية
                </label>
                <label [class.is-on]="accountForm.controls.preferredLanguage.value === 'en'">
                  <input type="radio" class="visually-hidden" formControlName="preferredLanguage" value="en" /> English
                </label>
              </div>
            </fieldset>
            <button type="submit" class="btn btn-primary" [disabled]="savingAccount() || accountForm.pristine">{{ 'common.save' | t }}</button>
          </form>
        </section>

        <section class="bc-panel" aria-labelledby="cf-h">
          <h2 id="cf-h" class="bc-h-md">Codeforces</h2>
          @if (d.cf.connected) {
            <dl class="bc-answers mb-3">
              <div><dt>{{ 'cf.handle' | t }}</dt><dd dir="ltr">{{ d.cf.handle }}</dd></div>
              <div><dt>{{ 'cf.rating' | t }}</dt><dd dir="ltr">{{ d.cf.rating }} · {{ d.cf.rank }}</dd></div>
              <div><dt>{{ 'cf.solved' | t }}</dt><dd>{{ d.cf.solvedMappedProblems }}</dd></div>
              <div><dt>{{ 'cf.lastSync' | t }}</dt><dd>{{ d.cf.lastSyncedAt ? (d.cf.lastSyncedAt | bcDate) : ('cf.never' | t) }}</dd></div>
            </dl>
            <div class="d-flex flex-wrap gap-2">
              <button type="button" class="btn btn-primary" [disabled]="cfBusy()" (click)="sync()">
                @if (cfBusy()) { <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> } @else { <bc-icon name="arrow-repeat" /> }
                {{ 'cf.sync' | t }}
              </button>
              <button type="button" class="btn btn-outline-dark" [disabled]="cfBusy()" (click)="disconnect()">{{ 'cf.disconnect' | t }}</button>
            </div>
          } @else {
            <p class="text-body-secondary">{{ 'cf.lead' | t }}</p>
            <form [formGroup]="cfForm" (ngSubmit)="connect()" novalidate>
              <label for="handle" class="form-label">{{ 'auth.cfHandle' | t }}</label>
              <div class="input-group">
                <input id="handle" class="form-control" formControlName="handle" dir="ltr" autocomplete="off"
                  [class.is-invalid]="cfForm.controls.handle.invalid && cfForm.controls.handle.touched || !!cfError()" />
                <button type="submit" class="btn btn-primary" [disabled]="cfBusy()">{{ 'cf.connect' | t }}</button>
                <div class="invalid-feedback">{{ cfError() ?? ('auth.cfHelp' | t) }}</div>
              </div>
            </form>
          }
        </section>

        <section class="bc-panel" aria-labelledby="stats-h">
          <h2 id="stats-h" class="bc-h-md">{{ 'profile.stats' | t }}</h2>
          <dl class="bc-answers">
            <div><dt>{{ 'dash.overallMastery' | t }}</dt><dd>{{ d.progress.overallMastery === null ? '—' : d.progress.overallMastery + '%' }}</dd></div>
            <div><dt>{{ 'profile.quizzesTaken' | t }}</dt><dd>{{ d.progress.quizzesTaken }}</dd></div>
            <div><dt>{{ 'dash.avgScore' | t }}</dt><dd>{{ d.progress.averageQuizScore === null ? '—' : d.progress.averageQuizScore + '%' }}</dd></div>
            <div><dt>{{ 'profile.openMistakes' | t }}</dt><dd>{{ d.progress.openMistakes }}</dd></div>
            <div><dt>{{ 'profile.solvedProblems' | t }}</dt><dd>{{ d.cf.connected ? d.progress.solvedProblems + '/' + d.progress.totalProblems : '—' }}</dd></div>
          </dl>
        </section>

        <section class="bc-panel bc-panel--quiet" aria-labelledby="priv-h">
          <h2 id="priv-h" class="bc-h-md">{{ 'profile.privacy' | t }}</h2>
          <p class="mb-0">{{ 'footer.data' | t }}</p>
        </section>

        <div>
          <button type="button" class="btn btn-outline-dark" (click)="signOut()">
            <bc-icon name="box-arrow-right" /> {{ 'nav.signOut' | t }}
          </button>
        </div>
      </div>
    } @else {
      <bc-loading />
    }
  `,
})
export class ProfilePage {
  private readonly api = inject(BaccaApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly auth = inject(Auth);
  protected readonly i18n = inject(I18n);

  protected readonly savingAccount = signal(false);
  protected readonly cfBusy = signal(false);
  protected readonly cfError = signal<string | null>(null);

  protected readonly data = rxResource({
    stream: () => forkJoin({ progress: this.api.getProgress(), cf: this.api.getCodeforcesStatus() }),
  });

  protected readonly accountForm = this.fb.nonNullable.group({
    fullName: [this.auth.user()?.fullName ?? '', [Validators.required, Validators.minLength(2)]],
    preferredLanguage: [(this.auth.user()?.preferredLanguage ?? 'en') as Lang],
  });
  protected readonly cfForm = this.fb.nonNullable.group({
    handle: ['', [Validators.required, Validators.pattern(HANDLE_PATTERN)]],
  });

  constructor() {
    // Show the language choice instantly; it is saved with the form.
    this.accountForm.controls.preferredLanguage.valueChanges.subscribe((l) => this.i18n.setLang(l));
    this.cfForm.controls.handle.valueChanges.subscribe(() => this.cfError.set(null));
    effect(() => {
      const lang = this.i18n.lang();
      if (this.accountForm.controls.preferredLanguage.value !== lang) {
        this.accountForm.controls.preferredLanguage.setValue(lang, { emitEvent: false });
      }
    });
  }

  protected signOut(): void {
    this.auth.logout().subscribe(() => void this.router.navigate(['/']));
  }

  protected saveAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    this.savingAccount.set(true);
    const v = this.accountForm.getRawValue();
    this.auth.updateProfile({ fullName: v.fullName, preferredLanguage: v.preferredLanguage }).subscribe({
      next: () => {
        this.savingAccount.set(false);
        this.accountForm.markAsPristine();
        this.toast.show(this.i18n.t('profile.saved'));
      },
      error: (e: unknown) => {
        this.savingAccount.set(false);
        this.toast.show(this.i18n.error(e), 'error');
      },
    });
  }

  protected connect(): void {
    if (this.cfForm.invalid) {
      this.cfForm.markAllAsTouched();
      return;
    }
    this.cfBusy.set(true);
    this.api.connectCodeforces(this.cfForm.getRawValue().handle.trim()).subscribe({
      next: () => {
        this.cfBusy.set(false);
        this.cfForm.reset();
        this.auth.reloadUser();
        this.data.reload();
        this.toast.show(this.i18n.t('cf.connected'));
      },
      error: (e: unknown) => {
        this.cfBusy.set(false);
        this.cfError.set(this.i18n.error(e));
      },
    });
  }

  protected sync(): void {
    this.cfBusy.set(true);
    this.api.syncCodeforces().subscribe({
      next: () => {
        this.cfBusy.set(false);
        this.data.reload();
        this.toast.show(this.i18n.t('cf.synced'));
      },
      error: (e: unknown) => {
        this.cfBusy.set(false);
        this.toast.show(this.i18n.error(e), 'error');
      },
    });
  }

  protected disconnect(): void {
    this.cfBusy.set(true);
    this.api.disconnectCodeforces().subscribe({
      next: () => {
        this.cfBusy.set(false);
        this.auth.reloadUser();
        this.data.reload();
        this.toast.show(this.i18n.t('cf.disconnected'));
      },
      error: (e: unknown) => {
        this.cfBusy.set(false);
        this.toast.show(this.i18n.error(e), 'error');
      },
    });
  }
}
