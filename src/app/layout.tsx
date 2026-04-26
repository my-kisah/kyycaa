import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Cerita Kita",
    template: "%s | Cerita Kita",
  },
  description:
    "Website romantis modern untuk menyimpan, membagikan, dan merawat kenangan indah dengan sistem user dan admin yang aman.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${manrope.variable} ${cormorant.variable} h-full scroll-smooth antialiased`}
    >
      <head />
      <body suppressHydrationWarning className="min-h-full bg-rose-50 font-sans text-rose-950">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
