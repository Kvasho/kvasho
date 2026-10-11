"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { useSession } from "../lib/session";

/** Centered card for signing in and up; signed-in users go straight to the app. */
export default function AuthLayout({ children }: LayoutProps<"/[lang]/invoicer">) {
  const { user } = useSession();
  const { t, href } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(href("/invoicer/dashboard"));
  }, [user, router, href]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <Link
        href={href("/")}
        className="mb-8 text-xs uppercase tracking-[0.3em] text-foreground/50 transition-colors hover:text-accent"
      >
        ← {t.common.backToWorks}
      </Link>
      <p className="font-display text-5xl uppercase leading-none">Invoicer</p>
      <div className="mt-8">{children}</div>
    </main>
  );
}
