import type { Metadata } from "next";
import { Anton, Geist, Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import Background from "@/components/background";
import CurtainProvider from "@/components/curtain";
import LanguageSwitcher from "@/components/language-switcher";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import I18nProvider from "@/i18n/provider";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

// Geist and Anton have no Georgian letters; this fills them in (see globals.css).
const notoGeorgian = Noto_Sans_Georgian({
  variable: "--font-georgian",
  subsets: ["georgian"],
  axes: ["wdth"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { t } = getDictionary((await params).lang);
  return { title: t.meta.site, description: t.meta.description };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang, t } = getDictionary((await params).lang);

  return (
    <html
      lang={lang}
      // Pages may set `data-theme` on <html> before hydration.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${notoGeorgian.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider lang={lang} dictionary={t}>
          <Background />
          <LanguageSwitcher />
          <CurtainProvider>{children}</CurtainProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
