import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../core/auth/auth';
import { ApiError } from '../core/api/api-error';
import { I18n, I18N_PIPES } from '../core/i18n/i18n';
import { Lang } from '../core/models';
import { Icon } from '../shared/icon';

/** At least 8 characters with a letter and a digit (spec 24.1 asks for password requirements). */
const PASSWORD_PATTERN = /^(?=.*[A-Za-z\u0600-\u06FF])(?=.*\d).{8,}$/;
const HANDLE_PATTERN = /^[A-Za-z0-9_.-]{3,24}$/;

@Component({
  selector: 'bc-register-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon, ...I18N_PIPES],
  template: `
    <section class="bc-auth">
      <h1>{{ 'auth.registerTitle' | t }}</h1>
      <p class="text-body-secondary">{{ 'auth.registerLead' | t }}</p>

      @if (error()) {
        <div class="bc-callout bc-callout--error" role="alert">
          <bc-icon name="exclamation-octagon" /> <p class="mb-0">{{ error() }}</p>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="mb-3">
          <label for="fullName" class="form-label">{{ 'auth.fullName' | t }}</label>
          <input id="fullName" class="form-control" formControlName="fullName" autocomplete="name"
            [class.is-invalid]="invalid('fullName')" [attr.aria-describedby]="invalid('fullName') ? 'name-err' : null" />
          @if (invalid('fullName')) { <div id="name-err" class="invalid-feedback">{{ 'val.required' | t }}</div> }
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">{{ 'auth.email' | t }}</label>
          <input id="email" type="email" class="form-control" formControlName="email" autocomplete="email" dir="ltr"
            [class.is-invalid]="invalid('email') || emailTaken()" [attr.aria-describedby]="invalid('email') || emailTaken() ? 'email-err' : null" />
          @if (emailTaken()) {
            <div id="email-err" class="invalid-feedback">{{ 'err.EMAIL_TAKEN' | t }}</div>
          } @else if (invalid('email')) {
            <div id="email-err" class="invalid-feedback">{{ 'val.email' | t }}</div>
          }
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">{{ 'auth.password' | t }}</label>
          <div class="input-group">
            <input id="password" [type]="show() ? 'text' : 'password'" class="form-control" formControlName="password"
              autocomplete="new-password" dir="ltr" [class.is-invalid]="invalid('password')"
              aria-describedby="pw-help" />
            <button type="button" class="btn btn-outline-dark" (click)="show.set(!show())" [attr.aria-pressed]="show()"
              [attr.aria-label]="(show() ? 'auth.hidePassword' : 'auth.showPassword') | t">
              <bc-icon [name]="show() ? 'eye-slash' : 'eye'" />
            </button>
          </div>
          <div id="pw-help" class="form-text" [class.text-danger]="invalid('password')">{{ 'val.password' | t }}</div>
        </div>

        <fieldset class="mb-3">
          <legend class="form-label fs-6">{{ 'auth.language' | t }}</legend>
          <div class="bc-seg bc-seg--wide">
            <label [class.is-on]="form.controls.preferredLanguage.value === 'ar'">
              <input type="radio" class="visually-hidden" formControlName="preferredLanguage" value="ar" /> العربية
            </label>
            <label [class.is-on]="form.controls.preferredLanguage.value === 'en'">
              <input type="radio" class="visually-hidden" formControlName="preferredLanguage" value="en" /> English
            </label>
          </div>
        </fieldset>

        <div class="mb-4">
          <label for="cf" class="form-label">{{ 'auth.cfHandle' | t }} <span class="text-body-secondary">({{ 'common.optional' | t }})</span></label>
          <input id="cf" class="form-control" formControlName="codeforcesHandle" dir="ltr" autocomplete="off"
            [class.is-invalid]="invalid('codeforcesHandle')" aria-describedby="cf-help" />
          <div id="cf-help" class="form-text" [class.text-danger]="invalid('codeforcesHandle')">{{ 'auth.cfHelp' | t }}</div>
        </div>

        <button type="submit" class="btn btn-primary w-100" [disabled]="busy()">
          @if (busy()) { <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> }
          {{ 'auth.createAccount' | t }}
        </button>
      </form>

      <p class="mt-4 mb-0">
        {{ 'auth.haveAccount' | t }}
        <a routerLink="/login">{{ 'auth.signIn' | t }}</a>
      </p>
    </section>
  `,
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly emailTaken = signal(false);
  protected readonly show = signal(false);
  private submitted = false;

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
    preferredLanguage: [this.i18n.lang() as Lang],
    codeforcesHandle: ['', Validators.pattern(HANDLE_PATTERN)],
  });

  constructor() {
    // Picking a language here switches the interface immediately, so the student sees the effect.
    this.form.controls.preferredLanguage.valueChanges.subscribe((l) => this.i18n.setLang(l));
    this.form.controls.email.valueChanges.subscribe(() => this.emailTaken.set(false));
    effect(() => {
      const lang = this.i18n.lang();
      if (this.form.controls.preferredLanguage.value !== lang) {
        this.form.controls.preferredLanguage.setValue(lang, { emitEvent: false });
      }
    });
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted);
  }

  protected submit(): void {
    this.submitted = true;
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.busy.set(true);
    this.auth
      .register({
        fullName: v.fullName,
        email: v.email,
        password: v.password,
        preferredLanguage: v.preferredLanguage,
        codeforcesHandle: v.codeforcesHandle.trim() || null,
      })
      .subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: (e: unknown) => {
          this.busy.set(false);
          if (ApiError.from(e).code === 'EMAIL_TAKEN') this.emailTaken.set(true);
          else this.error.set(this.i18n.error(e));
        },
      });
  }
}
