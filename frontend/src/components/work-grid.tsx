import type { ReactNode } from "react";
import type { CurtainOptions } from "@/components/curtain";
import GeoGuessArt from "@/components/geoguess-art";
import GuessFootballersArt from "@/components/guess-footballers-art";
import InvoicerArt from "@/components/invoicer-art";
import MinesArt from "@/components/mines-art";
import WorkBackdropProvider from "@/components/work-backdrop";
import WorkCard from "@/components/work-card";
import { format, localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

type Work = {
  title: string;
  category: string;
  href?: string;
  curtain?: CurtainOptions;
  art?: ReactNode;
  glow?: string;
  glowContrast?: string;
};

function buildWorks(lang: Locale, t: Dictionary["home"]): Work[] {
  const { works } = t;

  return [
    {
      ...works.footballers,
      href: localizePath(lang, "/guess-footballers"),
      curtain: {
        label: works.footballers.curtain,
        color: "#1b6e37",
        video: { src: "/goal.mp4", poster: "/goal-poster.jpg" },
      },
      art: <GuessFootballersArt />,
      glow: "#22c55e",
    },
    {
      ...works.mines,
      href: localizePath(lang, "/mines"),
      curtain: {
        label: works.mines.curtain,
        color: "#140d00",
        textColor: "#facc15",
        video: { src: "/explosion.mp4", tint: 0.25 },
      },
      art: <MinesArt />,
      glow: "#facc15",
      glowContrast: "#171717",
    },
    {
      ...works.geo,
      href: localizePath(lang, "/geoguess"),
      curtain: {
        label: works.geo.curtain,
        color: "#061227",
        video: { src: "/earth.mp4", poster: "/earth-poster.jpg", tint: 0.3 },
      },
      art: <GeoGuessArt />,
      glow: "#3b82f6",
    },
    {
      ...works.invoicer,
      href: localizePath(lang, "/invoicer"),
      curtain: {
        label: works.invoicer.curtain,
        color: "#2a0306",
        video: { src: "/payment.mp4", poster: "/payment-poster.jpg", tint: 0.35 },
      },
      art: <InvoicerArt />,
      glow: "#ef4444",
    },
    // Placeholder entries until the real works are added.
    ...Array.from({ length: 2 }, (_, i) => ({
      title: format(t.project, { n: i + 5 }),
      category: t.comingSoon,
    })),
  ];
}

export default function WorkGrid({ lang, t }: { lang: Locale; t: Dictionary["home"] }) {
  const works = buildWorks(lang, t);

  return (
    <WorkBackdropProvider>
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work, i) => (
          <WorkCard key={i} index={i + 1} {...work} />
        ))}
      </section>
    </WorkBackdropProvider>
  );
}
