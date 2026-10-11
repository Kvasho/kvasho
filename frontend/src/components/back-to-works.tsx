"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";

/** The "← Back to works" link at the top of every work's page. */
export default function BackToWorks() {
  const { t, href } = useI18n();

  return (
    <Link
      href={href("/")}
      className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-foreground/50 transition-colors duration-300 hover:text-accent"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
      >
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      {t.common.backToWorks}
    </Link>
  );
}
