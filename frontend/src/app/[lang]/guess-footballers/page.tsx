import type { Metadata } from "next";
import BackToWorks from "@/components/back-to-works";
import PageTheme from "@/components/page-theme";
import { getDictionary } from "@/i18n/get-dictionary";
import Game from "./game";
import Pitch from "./pitch";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/guess-footballers">): Promise<Metadata> {
  return { title: getDictionary((await params).lang).t.meta.footballers };
}

export default async function GuessFootballers({ params }: PageProps<"/[lang]/guess-footballers">) {
  const { t } = getDictionary((await params).lang);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-20 sm:px-10">
      <PageTheme name="pitch" />
      <div aria-hidden className="pitch-backdrop">
        <Pitch cover className="size-full" />
      </div>
      <BackToWorks />
      <h1 className="mt-6 font-display text-6xl uppercase leading-none sm:text-8xl">
        {t.footballers.title}
      </h1>
      <Game />
    </main>
  );
}
