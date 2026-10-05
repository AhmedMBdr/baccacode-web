import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { BaccaApi } from './core/api/baccacode-api';
import { HttpBaccaApi } from './core/api/http-baccacode-api';
import { Auth } from './core/auth/auth';
import { authInterceptor } from './core/auth/auth.interceptor';
import { APP_CONFIG } from './core/config';
import { MockBaccaApi } from './core/mock/mock-baccacode-api';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Route params and query params are bound straight to component inputs (id, topic, …).
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    // The one switch between the fake in-browser API and the real ASP.NET Core API (core/config.ts).
    { provide: BaccaApi, useClass: APP_CONFIG.useMock ? MockBaccaApi : HttpBaccaApi },
    // Restore the session (refresh-token cookie) before the first route is activated.
    provideAppInitializer(() => inject(Auth).init()),
  ],
};
