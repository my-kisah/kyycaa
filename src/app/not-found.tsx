import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/layout/site-shell";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center">
      <SiteShell className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-rose-500">404</p>
        <h1 className="mt-4 font-display text-6xl text-rose-950">
          Kenangan yang Anda cari tidak ditemukan.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-rose-800/80">
          Bisa jadi konten sudah dihapus, disembunyikan, atau URL yang dibuka tidak valid.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button>Kembali ke landing page</Button>
          </Link>
        </div>
      </SiteShell>
    </main>
  );
}
