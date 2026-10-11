"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { useSession } from "../lib/session";

/** Sections of the app; later stages add invoices here. */
const nav = [
  { path: "/invoicer/dashboard", key: "dashboard" },
  { path: "/invoicer/clients", key: "clients" },
  { path: "/invoicer/settings", key: "settings" },
] as const;

/**
 * The menu links. The current path is runtime data on dynamic pages such as
 * a client's, so this reads it under Suspense; until then nothing is marked.
 */
function NavLinks({ pathname = "" }: { pathname?: string }) {
  const { t, href } = useI18n();

  return nav.map((item) => {
    const active = pathname.startsWith(href(item.path));
    return (
      <Link
        key={item.path}
        href={href(item.path)}
        aria-current={active ? "page" : undefined}
        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
          active
            ? "bg-accent/10 font-medium text-accent"
            : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
        }`}
      >
        {t.invoicer.nav[item.key]}
      </Link>
    );
  });
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

/**
 * Signed-in area: sends guests to the sign-in page and frames every page with the menu.
 *
 * Pages always render, even before the session is known (they show nothing
 * user-specific until it is); that keeps a real shell for Next to prerender.
 */
export default function AppLayout({ children }: LayoutProps<"/[lang]/invoicer">) {
  const { user, logout } = useSession();
  const { t, href } = useI18n();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (user === null) router.replace(href("/invoicer/login"));
  }, [user, router, href]);

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:py-10">
        <aside className="shrink-0 lg:w-56" aria-hidden>
          <div className="flex items-center gap-3 lg:flex-col lg:items-start">
            <span className="size-10 animate-pulse rounded-lg bg-foreground/10" />
            <span className="h-4 w-32 animate-pulse rounded bg-foreground/10" />
          </div>
        </aside>
        <main className="invisible min-w-0 flex-1">{children}</main>
      </div>
    );
  }

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:py-10">
      <aside className="shrink-0 lg:w-56">
        <div className="flex items-center gap-3 lg:flex-col lg:items-start">
          {user.company?.logo_url ? (
            // Logos come from the API host, so next/image would need it whitelisted.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.company.logo_url} alt="" className="size-10 rounded-lg object-contain" />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent font-display text-lg text-accent-contrast">
              {user.company?.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.company?.name}</p>
            <p className="text-xs text-foreground/50">{user.role && t.invoicer.roles[user.role]}</p>
          </div>
        </div>

        <nav className="mt-6 flex gap-1 overflow-x-auto lg:flex-col">
          <Suspense fallback={<NavLinks />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>

        <div className="mt-6 hidden border-t border-foreground/10 pt-4 text-sm lg:block">
          <p className="truncate text-foreground/70">{user.name}</p>
          <p className="truncate text-xs text-foreground/50">{user.email}</p>
          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="mt-3 text-foreground/60 transition-colors hover:text-accent disabled:opacity-50"
          >
            {t.invoicer.nav.signOut}
          </button>
          <Link href={href("/")} className="mt-1 block text-foreground/60 transition-colors hover:text-accent">
            {t.common.backToWorks}
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>

      <button
        onClick={handleLogout}
        disabled={signingOut}
        className="text-sm text-foreground/60 hover:text-accent lg:hidden"
      >
        {t.invoicer.nav.signOut}
      </button>
    </div>
  );
}
