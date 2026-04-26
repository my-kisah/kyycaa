import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SiteShell } from "@/components/layout/site-shell";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <SiteShell className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal className="relative z-10 max-w-3xl" delay={40}>
          <p className="soft-shine mb-5 inline-flex rounded-full border border-white/60 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-rose-500 shadow-[0_16px_40px_rgba(208,148,170,0.12)] backdrop-blur-xl">
            Private Romantic Memory Platform
          </p>
          <h1 className="shimmer-text max-w-[11ch] font-display text-[clamp(2.3rem,5.1vw,4.2rem)] leading-[1.02] tracking-[-0.012em]">
            Website ini bersifat privat. Silakan login atau register terlebih dahulu untuk melihat isi di dalamnya.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-rose-800/80 md:text-xl">
            Halaman ini hanya menampilkan informasi pembuka. Semua konten
            kenangan, dashboard, detail cerita, komentar, dan fitur lainnya
            hanya bisa diakses oleh pengguna yang sudah memiliki akun dan berhasil login.
          </p>
          <div className="mt-8 rounded-[28px] border border-rose-200/70 bg-[rgba(255,250,252,0.88)] px-6 py-5 text-sm leading-8 text-rose-800 shadow-[0_16px_40px_rgba(208,148,170,0.12)] backdrop-blur-xl">
            <p className="font-semibold text-rose-950">Perhatian untuk pengunjung baru:</p>
            <p className="mt-2">
              Anda tidak dapat melihat isi dashboard atau konten kenangan tanpa akun.
              Jika sudah memiliki akun, silakan klik <span className="font-semibold">Login</span>.
              Jika belum, klik <span className="font-semibold">Register</span> terlebih dahulu.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/login">
              <Button className="button-sheen">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" className="button-sheen">Register</Button>
            </Link>
          </div>
          <div suppressHydrationWarning className="mt-10 grid gap-4 text-sm text-rose-800/80 sm:grid-cols-3">
            <div suppressHydrationWarning className="hover-glow rounded-[28px] border border-white/55 bg-white/55 px-5 py-4 shadow-[0_16px_40px_rgba(208,148,170,0.12)] backdrop-blur-xl">
              Pengunjung baru wajib login atau register lebih dulu.
            </div>
            <div suppressHydrationWarning className="hover-glow rounded-[28px] border border-white/55 bg-white/55 px-5 py-4 shadow-[0_16px_40px_rgba(208,148,170,0.12)] backdrop-blur-xl">
              Dashboard, cerita, dan komentar hanya terbuka setelah login.
            </div>
            <div suppressHydrationWarning className="hover-glow rounded-[28px] border border-white/55 bg-white/55 px-5 py-4 shadow-[0_16px_40px_rgba(208,148,170,0.12)] backdrop-blur-xl">
              Sistem dibuat privat agar isi kenangan tetap aman.
            </div>
          </div>
        </Reveal>

        <Reveal className="relative" delay={180}>
          <div className="absolute -left-4 top-8 h-24 w-24 rounded-full bg-rose-200/70 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-28 w-28 rounded-full bg-fuchsia-200/60 blur-3xl" />
          <div className="glass-card soft-shine relative overflow-hidden rounded-[36px] p-8 md:p-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-500">Akses Privat</p>
                <h3 className="font-display text-3xl text-rose-950">Ruang Kenangan</h3>
              </div>
              <div className="float-gentle rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">
                Secure Access
              </div>
            </div>
            <div className="space-y-4">
              <div className="hover-glow rounded-[28px] bg-[linear-gradient(135deg,rgba(246,201,219,0.92),rgba(251,243,238,0.86))] p-6 shadow-[0_24px_50px_rgba(209,131,164,0.18)]">
                <p className="font-display text-2xl text-rose-950">
                  Privasi yang lembut membuat setiap kenangan terasa lebih personal.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="hover-glow rounded-[24px] border border-white/55 bg-white/60 p-5">
                  <p className="text-3xl font-semibold text-rose-950">Login Required</p>
                  <p className="mt-2 text-sm leading-7 text-rose-800/75">
                    Semua isi dashboard dan detail konten tersembunyi dari guest.
                  </p>
                </div>
                <div className="hover-glow rounded-[24px] border border-white/55 bg-white/60 p-5">
                  <p className="text-3xl font-semibold text-rose-950">Email + Username</p>
                  <p className="mt-2 text-sm leading-7 text-rose-800/75">
                    Login sederhana dengan email atau username, admin tetap terjaga via akun khusus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </SiteShell>
    </section>
  );
}
