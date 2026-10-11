import AboutContent from "@/components/about-content";
import AboutPanel from "@/components/about-panel";
import Loader from "@/components/loader";
import WorkGrid from "@/components/work-grid";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang, t } = getDictionary((await params).lang);

  return (
    <>
      <Loader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-20 sm:px-10">
        <header className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
              {t.home.kicker}
            </p>
            <h1 className="mt-3 font-display text-6xl uppercase leading-none sm:text-8xl">
              {t.home.title}
            </h1>
          </div>
          <AboutPanel>
            <AboutContent t={t.about} />
          </AboutPanel>
        </header>
        <WorkGrid lang={lang} t={t.home} />
      </main>
    </>
  );
}
