import { Injectable, Pipe, PipeTransform, computed, signal } from '@angular/core';
import { ApiError } from '../api/api-error';
import { L10n, Lang } from '../models';
import { STRINGS, StringValue } from './strings';

const STORAGE_KEY = 'bc.lang';

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {
    /* storage blocked */
  }
  return typeof navigator !== 'undefined' && /^ar/i.test(navigator.language) ? 'ar' : 'en';
}

/**
 * UI language (ar | en) plus an optional separate *content* language, so a student
 * can keep the interface in Arabic while reading a lesson in English (spec 9.3).
 * Direction handling: the matching Bootstrap build (LTR or RTL) is switched by
 * toggling the `media` attribute of two pre-linked stylesheets (see index.html).
 */
@Injectable({ providedIn: 'root' })
export class I18n {
  readonly lang = signal<Lang>(initialLang());
  /** null = follow the UI language. */
  readonly contentOverride = signal<Lang | null>(null);
  readonly contentLang = computed<Lang>(() => this.contentOverride() ?? this.lang());
  readonly dir = computed(() => (this.lang() === 'ar' ? 'rtl' : 'ltr'));

  constructor() {
    this.apply(this.lang());
  }

  setLang(lang: Lang): void {
    if (lang === this.lang()) return;
    this.lang.set(lang);
    this.contentOverride.set(null);
    this.apply(lang);
  }

  setContentLang(lang: Lang): void {
    this.contentOverride.set(lang === this.lang() ? null : lang);
  }

  private apply(lang: Lang): void {
    if (typeof document === 'undefined') return;
    const rtl = lang === 'ar';
    const root = document.documentElement;
    root.lang = lang;
    root.dir = rtl ? 'rtl' : 'ltr';
    document.getElementById('bs-ltr')?.setAttribute('media', rtl ? 'not all' : 'all');
    document.getElementById('bs-rtl')?.setAttribute('media', rtl ? 'all' : 'not all');
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }

  /** Translate a UI string. Plural entries are picked with Intl.PluralRules using params['count']. */
  t(key: string, params?: Record<string, string | number>): string {
    const lang = this.lang();
    const raw: StringValue | undefined = STRINGS[lang][key] ?? STRINGS['en'][key];
    if (raw === undefined) return key;
    let text: string;
    if (typeof raw === 'string') {
      text = raw;
    } else {
      const count = Number(params?.['count'] ?? 0);
      const rule = new Intl.PluralRules(lang).select(count);
      text = raw[rule] ?? raw.other ?? key;
    }
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
  }

  /** Separator between items of an inline list: Arabic comma in Arabic, ", " in English. */
  listSeparator(): string {
    return this.lang() === 'ar' ? '، ' : ', ';
  }

  has(key: string): boolean {
    return STRINGS[this.lang()][key] !== undefined || STRINGS['en'][key] !== undefined;
  }

  /** Pick the UI-language side of a bilingual DTO field. */
  loc(value: L10n | null | undefined): string {
    return value ? value[this.lang()] || value.en : '';
  }

  /** Pick the *content*-language side (lessons, explanations). */
  cloc(value: L10n | null | undefined): string {
    return value ? value[this.contentLang()] || value.en : '';
  }

  private get locale(): string {
    return this.lang() === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
  }

  date(iso: string): string {
    return new Intl.DateTimeFormat(this.locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
      new Date(iso),
    );
  }

  /** "today", "yesterday", "3 days ago" in the UI language. */
  ago(iso: string): string {
    const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
    return new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' }).format(-Math.max(0, days), 'day');
  }

  /** "today", "tomorrow", "in 3 days". */
  inDays(iso: string): string {
    const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
    return new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' }).format(Math.max(0, days), 'day');
  }

  /** Message for an API error: translated by code when we have one, else the server text. */
  error(err: unknown): string {
    const e = ApiError.from(err);
    const key = `err.${e.code}`;
    return this.has(key) ? this.t(key) : e.message || this.t('err.UNKNOWN');
  }
}

/* The pipes are impure on purpose: they read the language signals, so templates
   re-render when the language changes without every component wiring that up. */

@Pipe({ name: 't', pure: false })
export class TPipe implements PipeTransform {
  constructor(private readonly i18n: I18n) {}
  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}

@Pipe({ name: 'loc', pure: false })
export class LocPipe implements PipeTransform {
  constructor(private readonly i18n: I18n) {}
  transform(value: L10n | null | undefined): string {
    return this.i18n.loc(value);
  }
}

@Pipe({ name: 'cloc', pure: false })
export class ClocPipe implements PipeTransform {
  constructor(private readonly i18n: I18n) {}
  transform(value: L10n | null | undefined): string {
    return this.i18n.cloc(value);
  }
}

@Pipe({ name: 'bcDate', pure: false })
export class BcDatePipe implements PipeTransform {
  constructor(private readonly i18n: I18n) {}
  transform(iso: string): string {
    return this.i18n.date(iso);
  }
}

@Pipe({ name: 'bcAgo', pure: false })
export class BcAgoPipe implements PipeTransform {
  constructor(private readonly i18n: I18n) {}
  transform(iso: string): string {
    return this.i18n.ago(iso);
  }
}

export const I18N_PIPES = [TPipe, LocPipe, ClocPipe, BcDatePipe, BcAgoPipe] as const;
