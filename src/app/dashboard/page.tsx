import { auth } from "@/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteShell } from "@/components/layout/site-shell";
import { ActivityCard } from "@/components/memories/activity-card";
import { ContentFilters } from "@/components/memories/content-filters";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { getVisibleActivities } from "@/lib/data";
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
