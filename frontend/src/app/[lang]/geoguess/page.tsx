import type { Metadata } from "next";
import BackToWorks from "@/components/back-to-works";
import PageTheme from "@/components/page-theme";
import { getDictionary } from "@/i18n/get-dictionary";
import GeoGame from "./geo-game";

export async function generateMetadata({ params }: PageProps<"/[lang]/geoguess">): Promise<Metadata> {
  return { title: getDictionary((await params).lang).t.meta.geo };
}

export default async function GeoGuess({ params }: PageProps<"/[lang]/geoguess">) {
  const { t } = getDictionary((await params).lang);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-20 sm:px-10">
      <PageTheme name="geo" />
      <BackToWorks />
      <h1 className="mt-6 font-display text-6xl uppercase leading-none sm:text-8xl">
        {t.geo.title}
      </h1>
      <GeoGame />
    </main>
  );
}
