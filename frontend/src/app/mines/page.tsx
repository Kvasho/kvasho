import type { Metadata } from "next";
import Link from "next/link";
import PageTheme from "@/components/page-theme";
import MinesGame from "./mines-game";

export const metadata: Metadata = {
  title: "Mines — KVASHO",
};

export default function Mines() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-20 sm:px-10">
      <PageTheme name="mines" />
      <Link
        href="/"
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
        Back to works
      </Link>
      <h1 className="mt-6 font-display text-6xl uppercase leading-none sm:text-8xl">
        Mines
      </h1>
      <MinesGame />
    </main>
  );
}
