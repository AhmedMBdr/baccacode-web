import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../core/auth/auth';
import { APP_CONFIG } from '../core/config';
import { I18n, I18N_PIPES } from '../core/i18n/i18n';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../core/mock/mock-engine';
import { Icon } from '../shared/icon';

@Component({
  selector: 'bc-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon, ...I18N_PIPES],
  template: `
    <section class="bc-auth">
      <h1>{{ 'auth.signInTitle' | t }}</h1>

      @if (error()) {
        <div class="bc-callout bc-callout--error" role="alert">
          <bc-icon name="exclamation-octagon" /> <p class="mb-0">{{ error() }}</p>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="mb-3">
          <label for="email" class="form-label">{{ 'auth.email' | t }}</label>
          <input id="email" type="email" class="form-control" formControlName="email" autocomplete="username" dir="ltr"
            [class.is-invalid]="invalid('email')" [attr.aria-describedby]="invalid('email') ? 'email-err' : null" />
          @if (invalid('email')) { <div id="email-err" class="invalid-feedback">{{ 'val.email' | t }}</div> }
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">{{ 'auth.password' | t }}</label>
          <div class="input-group">
            <input id="password" [type]="show() ? 'text' : 'password'" class="form-control" formControlName="password"
              autocomplete="current-password" dir="ltr" [class.is-invalid]="invalid('password')"
              [attr.aria-describedby]="invalid('password') ? 'pw-err' : null" />
            <button type="button" class="btn btn-outline-dark" (click)="show.set(!show())" [attr.aria-pressed]="show()"
              [attr.aria-label]="(show() ? 'auth.hidePassword' : 'auth.showPassword') | t">
              <bc-icon [name]="show() ? 'eye-slash' : 'eye'" />
            </button>
            @if (invalid('password')) { <div id="pw-err" class="invalid-feedback">{{ 'val.required' | t }}</div> }
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100" [disabled]="busy()">
          @if (busy()) { <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> }
          {{ 'auth.signIn' | t }}
        </button>
      </form>

      @if (demo) {
        <div class="bc-demo">
          <p class="mb-2">{{ 'auth.demoHint' | t }}</p>
          <button type="button" class="btn btn-outline-dark btn-sm" (click)="fillDemo()">{{ 'auth.useDemo' | t }}</button>
        </div>
      }

      <p class="mt-4 mb-0">
        {{ 'auth.noAccount' | t }}
        <a routerLink="/register">{{ 'auth.createAccount' | t }}</a>
      </p>
    </section>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(I18n);

  protected readonly demo = APP_CONFIG.useMock;
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly show = signal(false);
  private submitted = false;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected invalid(name: 'email' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted);
  }

  protected fillDemo(): void {
    this.form.setValue({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    this.error.set(null);
  }

  protected submit(): void {
    this.submitted = true;
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard');
      },
      error: (e: unknown) => {
        this.busy.set(false);
        this.error.set(this.i18n.error(e));
      },
    });
  }
}
