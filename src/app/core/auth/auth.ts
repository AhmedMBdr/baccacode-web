import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, shareReplay, tap } from 'rxjs';
import { BaccaApi } from '../api/baccacode-api';
import { I18n } from '../i18n/i18n';
import { AuthResultDto, LoginRequest, RegisterRequest, UpdateProfileRequest, UserDto } from '../models';

/**
 * Session state. The access token is held in memory only (spec 23.1: no long-lived
 * tokens in unsafe browser storage); the refresh token is an httpOnly cookie the
 * API sets, so on a page reload we simply call /auth/refresh.
 */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly api = inject(BaccaApi);
  private readonly i18n = inject(I18n);

  readonly user = signal<UserDto | null>(null);
  /** True once the first session-restore attempt has finished (guards wait for it). */
  readonly ready = signal(false);
  readonly isSignedIn = computed(() => this.user() !== null);
  readonly firstName = computed(() => this.user()?.fullName.trim().split(/\s+/)[0] ?? '');

  private accessToken: string | null = null;
  private refreshing$: Observable<AuthResultDto | null> | null = null;

  get token(): string | null {
    return this.accessToken;
  }

  /** Called once at startup. Never rejects: "not signed in" is a normal outcome. */
  init(): Promise<void> {
    return new Promise((resolve) => {
      this.refresh().subscribe(() => {
        this.ready.set(true);
        resolve();
      });
    });
  }

  /** Shared refresh so several parallel 401s trigger a single call. Emits null on failure. */
  refresh(): Observable<AuthResultDto | null> {
    this.refreshing$ ??= this.api.refresh().pipe(
      tap((r) => this.accept(r, false)),
      catchError(() => {
        this.clear();
        return of(null);
      }),
      finalize(() => (this.refreshing$ = null)),
      shareReplay(1),
    );
    return this.refreshing$;
  }

  login(body: LoginRequest): Observable<AuthResultDto> {
    return this.api.login(body).pipe(tap((r) => this.accept(r, true)));
  }

  register(body: RegisterRequest): Observable<AuthResultDto> {
    return this.api.register(body).pipe(tap((r) => this.accept(r, true)));
  }

  logout(): Observable<void> {
    return this.api.logout().pipe(
      catchError(() => of(undefined)),
      tap(() => this.clear()),
    );
  }

  updateProfile(body: UpdateProfileRequest): Observable<UserDto> {
    return this.api.updateMe(body).pipe(
      tap((u) => {
        this.user.set(u);
        this.i18n.setLang(u.preferredLanguage);
      }),
    );
  }

  /** Re-read the profile (e.g. after connecting a Codeforces handle). */
  reloadUser(): void {
    this.api.me().subscribe({ next: (u) => this.user.set(u), error: () => undefined });
  }

  clear(): void {
    this.accessToken = null;
    this.user.set(null);
  }

  private accept(result: AuthResultDto, applyLanguage: boolean): void {
    this.accessToken = result.accessToken;
    this.user.set(result.user);
    if (applyLanguage) this.i18n.setLang(result.user.preferredLanguage);
  }
}
