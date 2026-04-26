import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <main className="floating-hearts flex min-h-screen items-center py-12">
      <SiteShell className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal
          className="hidden rounded-[38px] bg-[linear-gradient(135deg,rgba(255,244,247,0.95),rgba(235,219,248,0.55))] p-10 shadow-[0_30px_80px_rgba(206,140,170,0.16)] lg:block"
          delay={60}
        >
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">New Memory Keeper</p>
          <h2 className="shimmer-text mt-5 font-display text-6xl leading-tight">
            Mulai menyimpan cerita manis dengan tampilan yang tenang dan elegan.
          </h2>
          <p className="mt-6 text-base leading-8 text-rose-800/80">
            Semua akun yang dibuat dari halaman ini otomatis menjadi user. Tidak
            ada register admin publik demi keamanan website, dan hanya email
            @gmail.com yang sementara diterima.
          </p>
        </Reveal>
        <AuthCard
          title="Register User"
          description="Buat akun dengan nama, username, email Gmail, dan password. Setelah berhasil, silakan login lalu selesaikan verifikasi OTP."
          backHref="/"
          backLabel="Kembali ke beranda"
        >
          <RegisterForm />
        </AuthCard>
      </SiteShell>
    </main>
  );
}
