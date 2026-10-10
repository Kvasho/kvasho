import type { ReactNode } from "react";
import type { CurtainOptions } from "@/components/curtain";
import GeoGuessArt from "@/components/geoguess-art";
import GuessFootballersArt from "@/components/guess-footballers-art";
import MinesArt from "@/components/mines-art";
import WorkBackdropProvider from "@/components/work-backdrop";
import WorkCard from "@/components/work-card";

type Work = {
  title: string;
  category: string;
  href?: string;
  curtain?: CurtainOptions;
  art?: ReactNode;
  glow?: string;
  glowContrast?: string;
};

const works: Work[] = [
  {
    title: "Guess Footballers",
    category: "Football game",
    href: "/guess-footballers",
    curtain: {
      label: "Play your game",
      color: "#1b6e37",
      video: { src: "/goal.mp4", poster: "/goal-poster.jpg" },
    },
    art: <GuessFootballersArt />,
    glow: "#22c55e",
  },
  {
    title: "Mines",
    category: "Luck game",
    href: "/mines",
    curtain: {
      label: "Watch your step",
      color: "#140d00",
      textColor: "#facc15",
      video: { src: "/explosion.mp4", tint: 0.25 },
    },
    art: <MinesArt />,
    glow: "#facc15",
    glowContrast: "#171717",
  },
  {
    title: "GeoGuess",
    category: "Geography game",
    href: "/geoguess",
    curtain: {
      label: "Find it on the map",
      color: "#061227",
      video: { src: "/earth.mp4", poster: "/earth-poster.jpg", tint: 0.3 },
    },
    art: <GeoGuessArt />,
    glow: "#3b82f6",
  },
  // Placeholder entries until the real works are added.
  ...Array.from({ length: 3 }, (_, i) => ({
    title: `Project ${i + 4}`,
    category: "Coming soon",
  })),
];

export default function WorkGrid() {
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
