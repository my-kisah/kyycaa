import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AccountFrozenPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason ?? "Tidak ada alasan yang ditulis admin.";

  return (
    <main className="floating-hearts flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-card max-w-2xl rounded-[36px] p-8 text-center md:p-10">
        <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Akun Dibekukan</p>
        <h1 className="mt-4 font-display text-5xl text-rose-950 md:text-6xl">
          Akun telah dibekukan
        </h1>
        <p className="mt-5 text-base leading-8 text-rose-800/82">
          Admin telah membekukan akses akun ini. Jika Anda merasa ini kesalahan,
          silakan hubungi admin website.
        </p>
        <div className="mt-8 rounded-[28px] border border-rose-200/80 bg-white/80 p-6 text-left shadow-[0_18px_40px_rgba(206,140,170,0.12)]">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Alasan pembekuan</p>
          <p className="mt-3 text-base leading-8 text-rose-900">{reason}</p>
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/">
            <Button variant="secondary">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
