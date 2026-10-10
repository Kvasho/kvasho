"use client";

import { useLayoutEffect } from "react";

/** Themes defined in globals.css as `:root[data-theme="…"]`. */
type Theme = "pitch" | "mines" | "geo";

/**
 * Restyles the site (background, and for some themes the accent colour)
 * while the page rendering this is on screen.
 *
 * Next.js keeps a page mounted but hidden after navigating away, so the theme
 * can't hang off the page's markup: it would stick everywhere. Effects are
 * cleaned up when the page is hidden, which is what turns it off again.
 */
export default function PageTheme({ name }: { name: Theme }) {
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = name;
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [name]);

  // Applies the theme before the first paint on a direct visit or refresh.
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.dataset.theme=${JSON.stringify(name)}`,
      }}
    />
  );
}
