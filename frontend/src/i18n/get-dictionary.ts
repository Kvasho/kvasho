import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./config";
import { en } from "./dictionaries/en";
import { ka } from "./dictionaries/ka";

const dictionaries = { en, ka };

/** The dictionary for a `[lang]` route param; unknown languages are a 404. */
export function getDictionary(lang: string) {
  if (!hasLocale(lang)) notFound();
  return { lang: lang as Locale, t: dictionaries[lang] };
}
