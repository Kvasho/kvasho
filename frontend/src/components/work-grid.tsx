import type { ReactNode } from "react";
import type { CurtainOptions } from "@/components/curtain";
import GuessFootballersArt from "@/components/guess-footballers-art";
import WorkCard from "@/components/work-card";

type Work = {
  title: string;
  category: string;
  href?: string;
  curtain?: CurtainOptions;
  art?: ReactNode;
  glow?: string;
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
  // Placeholder entries until the real works are added.
  ...Array.from({ length: 5 }, (_, i) => ({
    title: `Project ${i + 2}`,
    category: "Coming soon",
  })),
];

export default function WorkGrid() {
  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {works.map((work, i) => (
        <WorkCard key={i} index={i + 1} {...work} />
      ))}
    </section>
  );
}
