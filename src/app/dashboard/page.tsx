import { auth } from "@/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteShell } from "@/components/layout/site-shell";
import { ActivityCard } from "@/components/memories/activity-card";
import { ContentFilters } from "@/components/memories/content-filters";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { getVisibleActivities } from "@/lib/data";
import { Globe2, Code2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; month?: string; denied?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const activities = await getVisibleActivities(params);
  const categories = [...new Set(activities.map((item) => item.category))];
  const months = [
    ...new Set(
      activities.map((item) =>
        new Date(item.date).toISOString().slice(0, 7),
      ),
    ),
  ];

  return (
    <div suppressHydrationWarning className="floating-hearts min-h-screen pb-16">
      <SiteHeader />
      <SiteShell className="space-y-8 py-12">
        <Reveal className="glass-card soft-shine rounded-[36px] p-8" delay={40}>
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">User Dashboard</p>
          <h1 className="shimmer-text mt-3 font-display text-5xl">
            Selamat datang, {session?.user?.name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-rose-800/80">
            di sini adalah dokumentasi kenangan kita dimana semuanya di simpan
          </p>
          <div className="mt-6">
            <Link href="/dashboard/profile">
              <Button variant="secondary" className="button-sheen">Kelola Profil</Button>
            </Link>
          </div>
          {params.denied === "admin" ? (
            <p className="mt-4 text-sm text-rose-600">
              Akses admin ditolak. Anda masuk sebagai user biasa.
            </p>
          ) : null}
        </Reveal>

        <Reveal delay={90}>
          <section className="rounded-[34px] border border-rose-200/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,246,250,0.92))] p-6 shadow-[0_20px_48px_rgba(206,140,170,0.12)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
              Tautan Pilihan
            </p>
            <div className="mt-4">
              <div>
                <h2 className="font-display text-3xl text-rose-950">
                  Ruang tautan yang ingin tetap dekat
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-800/78">
                  Kumpulan tautan ini tampil khusus setelah login, jadi website versi pertama dan halaman GitHub Anda bisa dibuka cepat langsung dari dashboard.
                </p>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <a
                  href="https://forncaa.github.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[28px] border border-rose-200/90 bg-white/88 p-5 shadow-[0_16px_34px_rgba(206,140,170,0.09)] transition hover:-translate-y-1 hover:border-rose-300 hover:bg-rose-50/80 hover:shadow-[0_24px_44px_rgba(206,140,170,0.14)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f7adc7,#d694aa)] text-white shadow-[0_14px_28px_rgba(214,148,170,0.24)]">
                      <Globe2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
                        Website Kita
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-rose-950">
                        Website kita versi pertama
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-rose-800/76">
                        Arsip awal yang bisa dibuka kembali kapan saja untuk melihat versi pertama yang pernah dibuat.
                      </p>
                    </div>
                  </div>
                </a>

                <a
                  href="https://github.com/depoizon"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[28px] border border-rose-200/90 bg-white/88 p-5 shadow-[0_16px_34px_rgba(206,140,170,0.09)] transition hover:-translate-y-1 hover:border-rose-300 hover:bg-rose-50/80 hover:shadow-[0_24px_44px_rgba(206,140,170,0.14)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3b2b37,#161015)] text-white shadow-[0_14px_28px_rgba(40,25,35,0.3)]">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
                        Alternatif
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-rose-950">
                        GitHub depoizon
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-rose-800/76">
                        Jika ingin membuka ruang proyek dan arsip pengembangan, tautan GitHub ini bisa langsung dipakai dari dashboard.
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <ContentFilters categories={categories} months={months} />
        </Reveal>

        {activities.length ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {activities.map((activity, index) => (
              <Reveal key={activity.id} delay={160 + index * 70}>
                <ActivityCard activity={activity} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada konten yang cocok"
            description="Coba ubah kata kunci pencarian atau filter. Konten yang disembunyikan admin memang tidak akan tampil di dashboard user."
          />
        )}
      </SiteShell>
    </div>
  );
}
