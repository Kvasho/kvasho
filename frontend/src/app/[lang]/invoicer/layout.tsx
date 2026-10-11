import type { Metadata } from "next";
import PageTheme from "@/components/page-theme";
import { getDictionary } from "@/i18n/get-dictionary";
import InvoicerBackdrop from "./backdrop";
import SessionProvider from "./lib/session";

export async function generateMetadata({ params }: LayoutProps<"/[lang]/invoicer">): Promise<Metadata> {
  return { title: getDictionary((await params).lang).t.meta.invoicer };
}

export default function InvoicerLayout({ children }: LayoutProps<"/[lang]/invoicer">) {
  return (
    <>
      <PageTheme name="invoicer" />
      <InvoicerBackdrop />
      <SessionProvider>{children}</SessionProvider>
    </>
  );
}
