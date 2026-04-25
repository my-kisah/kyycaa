import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";
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
      <body suppressHydrationWarning className="min-h-full bg-rose-50 font-sans text-rose-950">
        <Script id="strip-browser-injected-attrs" strategy="beforeInteractive">
          {`
            (() => {
              const ATTRS = [
                "bis_skin_checked",
                "bis_status",
                "bis_frame_id"
              ];
              const DYNAMIC_PREFIXES = [
                "__processed_"
              ];

              const shouldRemove = (name) =>
                ATTRS.includes(name) || DYNAMIC_PREFIXES.some((prefix) => name.startsWith(prefix));

              const cleanNode = (node) => {
                if (!(node instanceof Element)) return;

                for (const attr of Array.from(node.attributes)) {
                  if (shouldRemove(attr.name)) {
                    node.removeAttribute(attr.name);
                  }
                }
              };

              const cleanTree = (root = document) => {
                cleanNode(document.documentElement);
                cleanNode(document.body);
                if (!(root instanceof ParentNode)) return;
                root.querySelectorAll("*").forEach(cleanNode);
              };

              cleanTree();

              const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                  if (mutation.type === "attributes" && mutation.target instanceof Element) {
                    cleanNode(mutation.target);
                  }

                  mutation.addedNodes.forEach((node) => {
                    if (node instanceof Element) {
                      cleanNode(node);
                      node.querySelectorAll("*").forEach(cleanNode);
                    }
                  });
                }
              });

              const start = () => {
                if (!document.documentElement) return;
                observer.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true,
                });

                let ticks = 0;
                const interval = window.setInterval(() => {
                  cleanTree();
                  ticks += 1;
                  if (ticks > 40) {
                    window.clearInterval(interval);
                    observer.disconnect();
                  }
                }, 250);
              };

              if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", start, { once: true });
              } else {
                start();
              }
            })();
          `}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
