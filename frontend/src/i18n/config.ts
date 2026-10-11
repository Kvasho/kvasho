export const locales = ["en", "ka"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Remembers the language a visitor switched to, so `/` sends them back to it. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** `path` ("/mines") inside the given language ("/ka/mines"). */
export function localizePath(locale: Locale, path: string) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** The same page in another language: "/ka/mines" → "/en/mines". */
export function switchLocalePath(pathname: string, locale: Locale) {
  const [, first, ...rest] = pathname.split("/");
  const tail = hasLocale(first) ? rest : [first, ...rest].filter(Boolean);
  return localizePath(locale, `/${tail.join("/")}`.replace(/\/$/, "") || "/");
}

/** Fill `{name}` placeholders: format("{count} clients", { count: 3 }). */
export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/*
 * Numbers and dates are formatted here rather than with Intl's "ka" locale:
 * browsers built without Georgian data (headless Edge, for one) silently fall
 * back to English for it.
 */

/** 1234567 → "1,234,567" in English, "1 234 567" in Georgian. */
export function formatNumber(value: number, locale: Locale) {
  const text = value.toLocaleString("en-US");
  return locale === "ka" ? text.replace(/,/g, " ") : text;
}

type MonthNames = { months: string[]; monthsShort: string[] };

/** "19 May 2024" / "19 მაი 2024", read in UTC so a calendar day never shifts. */
export function formatDay(date: Date, names: MonthNames) {
  return `${date.getUTCDate()} ${names.monthsShort[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "October 2026" / "ოქტომბერი 2026", in the viewer's time zone. */
export function formatMonthYear(date: Date, names: MonthNames) {
  return `${names.months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Pick the singular or plural form and fill it in. English needs both;
 * Georgian keeps nouns singular after numbers, so its two forms are the same.
 */
export function plural(
  count: number,
  forms: { one: string; other: string },
  values: Record<string, string | number> = {},
) {
  return format(count === 1 ? forms.one : forms.other, { count, ...values });
}
