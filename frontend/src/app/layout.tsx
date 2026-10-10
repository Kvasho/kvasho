import type { Metadata } from "next";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import Background from "@/components/background";
import CurtainProvider from "@/components/curtain";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "KVASHO",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Pages may set `data-theme` on <html> before hydration.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Background />
        <CurtainProvider>{children}</CurtainProvider>
      </body>
    </html>
  );
}
