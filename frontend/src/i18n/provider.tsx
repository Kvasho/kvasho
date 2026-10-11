"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { formatDay, formatMonthYear, formatNumber, localizePath, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

type I18n = {
  lang: Locale;
  t: Dictionary;
  /** A site path in the current language: href("/mines") → "/ka/mines". */
  href: (path: string) => string;
  /** Numbers and dates written the way the current language does. */
  fmt: {
    number: (value: number) => string;
    day: (date: Date) => string;
    monthYear: (date: Date) => string;
  };
};

const I18nContext = createContext<I18n | null>(null);

export function useI18n() {
  const i18n = useContext(I18nContext);
  if (!i18n) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return i18n;
}

/** Hands the current language's dictionary, loaded by the root layout, to client components. */
export default function I18nProvider({
  lang,
  dictionary,
  children,
}: {
  lang: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      lang,
      t: dictionary,
      href: (path: string) => localizePath(lang, path),
      fmt: {
        number: (value: number) => formatNumber(value, lang),
        day: (date: Date) => formatDay(date, dictionary.dates),
        monthYear: (date: Date) => formatMonthYear(date, dictionary.dates),
      },
    }),
    [lang, dictionary],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}
