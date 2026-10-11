import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

/**
 * The language for a visitor: the one they last switched to, else the first
 * supported one in their browser's Accept-Language, else English.
 */
function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && hasLocale(saved)) return saved;

  const accepted = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = params.find((param) => param.trim().startsWith("q="));
      return { language: tag.split("-")[0].toLowerCase(), q: quality ? Number(quality.trim().slice(2)) : 1 };
    })
    .filter((entry) => entry.language && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  return accepted.map((entry) => entry.language).find(hasLocale) ?? defaultLocale;
}

/** Sends paths without a language ("/mines") to the visitor's language ("/ka/mines"). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if ((locales as readonly string[]).includes(first)) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and files with an extension (videos, images, favicon).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
