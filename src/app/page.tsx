import { auth } from "@/auth";
import { AboutSection } from "@/components/marketing/about-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const dynamic = "force-dynamic";

export default async function Home() {
  await auth();

  return (
    <div
      suppressHydrationWarning
      className="floating-hearts relative min-h-screen overflow-x-hidden"
    >
      <SiteHeader />
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
      </main>
      <SiteFooter />
    </div>
  );
}
