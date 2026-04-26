import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";

export function SiteFooter() {
  return (
    <footer
      suppressHydrationWarning
      className="border-t border-white/50 bg-[rgba(255,248,251,0.68)] py-10 backdrop-blur-2xl"
    >
      <SiteShell className="flex flex-col gap-5 text-sm text-rose-800/80 md:flex-row md:items-center md:justify-between">
        <div suppressHydrationWarning>
          <p className="font-display text-2xl text-rose-950">Cerita Kita</p>
          <p className="mt-2 max-w-xl leading-7">
            Simpan setiap momen indah dalam satu tempat, bagikan kisah terbaik,
            dan rayakan kenangan dengan tampilan yang lembut serta profesional.
          </p>
        </div>
        <div suppressHydrationWarning className="flex flex-wrap gap-4">
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/admin/login">Admin Login</Link>
        </div>
      </SiteShell>
    </footer>
  );
}
