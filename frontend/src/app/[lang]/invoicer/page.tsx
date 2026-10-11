import { redirect } from "next/navigation";
import { localizePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function InvoicerHome({ params }: PageProps<"/[lang]/invoicer">) {
  const { lang } = getDictionary((await params).lang);
  redirect(localizePath(lang, "/invoicer/dashboard"));
}
