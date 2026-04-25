import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="floating-hearts flex min-h-screen items-center py-12">
      <SiteShell className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal
          className="hidden rounded-[38px] bg-[linear-gradient(135deg,rgba(244,190,212,0.8),rgba(255,248,243,0.55))] p-10 shadow-[0_30px_80px_rgba(206,140,170,0.16)] lg:block"
          delay={60}
        >
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Welcome Back</p>
          <h2 className="shimmer-text mt-5 font-display text-6xl leading-tight">
            Buka lagi cerita yang ingin tetap terasa dekat.
          </h2>
          <p className="mt-6 text-base leading-8 text-rose-800/80">
            Login untuk membaca detail kenangan, melihat semua cerita aktif, dan
            ikut meninggalkan komentar yang hangat.
          </p>
        </Reveal>
        <AuthCard
          title="Login User"
          description="Masuk menggunakan email atau username dan password untuk membuka semua cerita dan fitur komentar."
        >
          <LoginForm portal="user" callbackUrl={params.callbackUrl} />
        </AuthCard>
      </SiteShell>
    </main>
  );
}
