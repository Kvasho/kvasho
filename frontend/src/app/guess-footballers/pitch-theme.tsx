"use client";

import { useLayoutEffect } from "react";

/**
 * Switches the site background to the football-green theme while this page
 * is on screen.
 *
 * Next.js keeps a page mounted but hidden after navigating away, so the theme
 * can't hang off the page's markup: it would stay green everywhere. Effects
 * are cleaned up when the page is hidden, which is what turns it off again.
 */
export default function PitchTheme() {
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = "pitch";
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, []);

  // Applies the theme before the first paint on a direct visit or refresh.
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: 'document.documentElement.dataset.theme="pitch"',
      }}
    />
  );
}
