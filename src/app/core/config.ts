/**
 * Runtime switches for the SPA.
 *
 * useMock = true  → the whole app runs against an in-browser fake of the API
 *                   (core/mock/*) so the frontend can be built and demoed before
 *                   the ASP.NET Core backend exists. Data lives in localStorage.
 * useMock = false → every call goes to `apiBaseUrl` through HttpClient.
 *                   In `ng serve`, /api is proxied by proxy.conf.json.
 */
export const APP_CONFIG = {
  useMock: true,
  apiBaseUrl: '/api/v1',
} as const;
