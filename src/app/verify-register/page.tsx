import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterOtpForm } from "@/components/auth/register-otp-form";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";

export default async function VerifyRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{
    challenge?: string;
    email?: string;
    debug?: string;
  }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  const params = await searchParams;

  if (!params.challenge) {
    redirect("/register");
  }

  return (
    <main className="floating-hearts flex min-h-screen items-center py-12">
      <SiteShell className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal
          className="hidden rounded-[38px] bg-[linear-gradient(135deg,rgba(255,244,247,0.95),rgba(235,219,248,0.55))] p-10 shadow-[0_30px_80px_rgba(206,140,170,0.16)] lg:block"
          delay={60}
        >
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Private Activation</p>
          <h2 className="shimmer-text mt-5 font-display text-6xl leading-tight">
            Akun baru diaktifkan dengan OTP agar tetap full private dan lebih aman.
          </h2>
          <p className="mt-6 text-base leading-8 text-rose-800/80">
            Setelah register berhasil, kode OTP dikirim ke email Gmail Anda. Verifikasi
            ini memastikan hanya pemilik email yang benar-benar bisa mengaktifkan akun.
          </p>
        </Reveal>
        <AuthCard
          title="Verifikasi Register"
          description="Masukkan kode OTP dari email untuk menyelesaikan pembuatan akun. Setelah berhasil, Anda bisa login seperti biasa."
          backHref="/register"
          backLabel="Kembali ke register"
        >
          <RegisterOtpForm
            challengeId={params.challenge}
            maskedEmail={params.email}
            developmentCode={process.env.NODE_ENV === "development" ? params.debug : undefined}
          />
        </AuthCard>
      </SiteShell>
    </main>
  );
}
