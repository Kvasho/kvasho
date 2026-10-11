import type { Metadata } from "next";
import BackToWorks from "@/components/back-to-works";
import PageTheme from "@/components/page-theme";
import { getDictionary } from "@/i18n/get-dictionary";
import MinesGame from "./mines-game";

export async function generateMetadata({ params }: PageProps<"/[lang]/mines">): Promise<Metadata> {
  return { title: getDictionary((await params).lang).t.meta.mines };
}

export default async function Mines({ params }: PageProps<"/[lang]/mines">) {
  const { t } = getDictionary((await params).lang);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-20 sm:px-10">
      <PageTheme name="mines" />
      <BackToWorks />
      <h1 className="mt-6 font-display text-6xl uppercase leading-none sm:text-8xl">
        {t.mines.title}
      </h1>
      <MinesGame />
    </main>
  );
}
