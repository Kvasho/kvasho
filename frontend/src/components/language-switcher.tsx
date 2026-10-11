"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, locales, switchLocalePath, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

const LABELS: Record<Locale, string> = { en: "EN", ka: "ქა" };

function remember(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

function Options({ pathname }: { pathname: string }) {
  const { lang, t } = useI18n();

  return locales.map((locale) => {
    const active = locale === lang;
    return (
      // A plain link: the whole document (fonts, <html lang>) changes language.
      <a
        key={locale}
        href={switchLocalePath(pathname, locale)}
        hrefLang={locale}
        lang={locale}
        aria-current={active ? "true" : undefined}
        aria-label={t.language.names[locale]}
        onClick={() => remember(locale)}
        className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.15em] transition-colors duration-300 ${
          active ? "bg-accent text-accent-contrast" : "text-foreground/60 hover:text-foreground"
        }`}
      >
        {LABELS[locale]}
      </a>
    );
  });
}

function CurrentPathOptions() {
  return <Options pathname={usePathname()} />;
}

/** EN / ქა toggle in the corner of every page; keeps the visitor on the same page. */
export default function LanguageSwitcher() {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t.language.label}
      className="fixed top-4 right-4 z-50 flex gap-0.5 rounded-full border border-foreground/10 bg-background/70 p-1 backdrop-blur-md sm:top-5 sm:right-6"
    >
      {/* The path is runtime data on dynamic routes, so it is read under Suspense. */}
      <Suspense fallback={<Options pathname="/" />}>
        <CurrentPathOptions />
      </Suspense>
    </nav>
  );
}
