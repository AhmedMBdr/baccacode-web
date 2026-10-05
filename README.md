# BaccaCode — web frontend

Angular 22 + TypeScript + Bootstrap 5 single-page app for BaccaCode (see `BaccaCode.md`).
Bilingual Arabic (RTL) / English (LTR), mobile-first, no backend required to run it.

## Run it

Needs Node `^22.22.3` or `^24.15` (Angular 22 requirement).

```bash
npm install
npm start          # http://localhost:4200
npm test           # unit tests (Vitest): scoring rules + mock backend
npm run build      # production build in dist/
```

Demo student: `demo@baccacode.dev` / `Demo1234!` — it has eight past quiz attempts, so the dashboard,
mistake bank and study plan all have something to show. Registering a new student starts from nothing
(that is where the 5-question check-up is offered).

## Mock API vs. real API

Pages never call HTTP directly. They inject the abstract class `BaccaApi` (`src/app/core/api/baccacode-api.ts`),
one method per endpoint in section 22 of the spec.

| `core/config.ts` | What runs |
| --- | --- |
| `useMock: true` (default) | `MockBaccaApi` — an in-browser fake of the whole backend, state in `localStorage` |
| `useMock: false` | `HttpBaccaApi` — `HttpClient` calls to `apiBaseUrl` (`/api/v1`), proxied in `ng serve` by `proxy.conf.json` |

To go live: set `useMock: false`, point `proxy.conf.json` at your ASP.NET Core dev URL, delete `src/app/core/mock/`.
Nothing in `pages/`, `shared/` or `layout/` changes.

The mock backend is not product code. Its grading, mastery and study-plan rules
(`core/mock/scoring.ts`, spec sections 11 and 12) are written as small pure functions with table-style
tests so the C# services can be ported and checked against the same numbers.

## Contract notes for the backend (`src/app/core/models.ts`)

The DTOs follow Appendix A, with three deliberate changes. Please mirror them in C#:

1. **Localised text is `{ ar, en }`** (one `LocalizedText` type, mapped with EF Core `OwnsOne`), not separate `TitleAr`/`TitleEn` DTO fields.
2. **Study-plan reasons and actions are codes plus numbers** (`{ code: 'OPEN_MISTAKES', value: 4 }`, `{ code: 'SOLVE_PROBLEMS', count: 2 }`),
   not English sentences. The API stays language-neutral; the SPA turns codes into proper Arabic or English, including Arabic plural forms.
3. **Quiz questions never include the correct option** until the attempt is submitted; the review endpoint returns the
   answer snapshots (question text, chosen text, correct text, explanation) so edits to content never rewrite history.

Other things the frontend expects:

- Error body `{ status, code, message, traceId }` (spec 24.2). The SPA translates by `code`; keep the codes in `strings.ts` (`err.*`) in sync.
- Access token in memory only; the refresh token is an httpOnly cookie (`withCredentials` on `/auth/*`). Configure CORS to allow credentials if the API is on another origin.
- Added beyond the spec's list: `GET /quizzes/diagnostic` (the optional check-up) and `TopicSummaryDto.reasons`
  (so the topic browser can show the same "why" as the study plan).
- Lesson Markdown is escaped for raw HTML, then sanitised again by Angular; code blocks are always LTR.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` tests, builds and publishes the app on every push to `main`.

1. Create an empty repository on GitHub (public repositories get Pages for free).
2. Push this folder to it: `git init`, `git add .`, `git commit -m "BaccaCode frontend"`,
   `git branch -M main`, `git remote add origin <repo-url>`, `git push -u origin main`.
3. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Watch the **Actions** tab. When it turns green the site is at `https://<user>.github.io/<repo>/`.

The workflow builds with `--base-href /<repo>/` (or `/` for a `<user>.github.io` repository) and copies
`index.html` to `404.html`, because Pages cannot serve `index.html` for deep links like `/topics/5` by itself.
The deployed site runs on the in-browser mock API: data is per visitor and per browser. Pages only hosts static
files, so the ASP.NET Core API has to live elsewhere; when it does, set `useMock: false` and use its full `https://`
address as `apiBaseUrl`. Because the site and the API will then be on different domains, the API must allow CORS
with credentials, and the refresh cookie needs `SameSite=None; Secure`.

## Where things are

```
src/app/
  core/        api (BaccaApi + HTTP impl), auth (state, interceptor, guards), i18n, models, mock/
  layout/      app shell (sidebar / phone tab bar), public layout, language toggle
  shared/      code block, markdown, mastery meter, reasons + actions, loading/error/toast
  pages/       one component per screen (home, dashboard, topics, topic, quiz, attempts, review, mistakes, study-plan, profile)
src/styles.scss   the whole design system (tokens, Bootstrap tuning, page styles)
```

Languages: UI text lives in `core/i18n/strings.ts` (EN and AR side by side; plural entries use `Intl.PluralRules`,
so Arabic gets its six forms). Lesson/quiz content is not there — it arrives from the API as `{ ar, en }`.
The topic page has its own content-language switch, so a student can keep the UI in Arabic and read a lesson in English.
Direction: both Bootstrap builds are linked in `index.html`; `I18n` flips which one applies, and all custom CSS uses logical properties.

## Not included

- Admin screens (the spec manages content through Swagger/API first).
- A real Codeforces lookup — the mock fakes `user.info` / `user.status` (a handle containing `nouser` is "not found").
- The curriculum is 8 topics of placeholder content, enough to exercise every screen. Replace it through your content tools.

## Checked

Built for production and driven in headless Chromium in English and Arabic at 1280px and 390px wide: sign-in, register
validation, guards, check-up, quiz (answer / skip / submit / retake), review, mistakes, plan, profile + Codeforces,
404. No console errors and no horizontal overflow on any screen. Not tested on real phones or with a screen reader.
