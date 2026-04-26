import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SiteShell } from "@/components/layout/site-shell";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <main className="floating-hearts flex min-h-screen items-center py-12">
      <SiteShell className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden rounded-[38px] bg-[linear-gradient(135deg,rgba(255,241,245,0.9),rgba(239,213,229,0.72))] p-10 shadow-[0_30px_80px_rgba(206,140,170,0.16)] lg:block">
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Private Portal</p>
          <h2 className="mt-5 font-display text-6xl leading-tight text-rose-950">
            Area admin untuk mengelola seluruh cerita dan insight website.
          </h2>
          <p className="mt-6 text-base leading-8 text-rose-800/80">
            Halaman ini hanya menerima akun admin yang sudah ditentukan oleh
            pemilik website. Tidak ada register admin publik.
          </p>
        </div>
        <AuthCard
          title="Login Admin"
          description="Masuk menggunakan email admin dan password yang sudah dibuat khusus oleh pemilik website."
          backHref="/"
          backLabel="Kembali ke beranda"
        >
          <LoginForm portal="admin" callbackUrl={params.callbackUrl} />
        </AuthCard>
      </SiteShell>
    </main>
  );
}
