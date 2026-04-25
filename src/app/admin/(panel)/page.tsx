import Link from "next/link";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { StatsGrid } from "@/components/admin/stats-grid";
import { Badge } from "@/components/ui/badge";
import { getAdminOverview } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();

  return (
    <div className="space-y-6">
      <StatsGrid
        items={[
          {
            label: "Total Konten",
            value: overview.totalActivities,
            helper: `${overview.activeActivities} aktif`,
            tone: "activities",
          },
          {
            label: "Total Komentar",
            value: overview.totalComments,
            helper: "semua komentar",
            tone: "comments",
          },
          {
            label: "Total User",
            value: overview.totalUsers,
            helper: "akun terdaftar",
            tone: "users",
          },
          {
            label: "Total View",
            value: overview.totalViews,
            helper: `${overview.hiddenActivities} hidden`,
            tone: "views",
          },
        ]}
      />

      <AnalyticsCharts
        viewsData={overview.popularViews}
        commentsData={overview.popularComments}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Konten Terbaru</p>
              <h2 className="mt-2 font-display text-3xl text-rose-950">Daftar terbaru</h2>
            </div>
            <Link href="/admin/content" className="text-sm font-semibold text-rose-600">
              Lihat semua
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {overview.latestActivities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-[24px] border border-white/55 bg-white/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-rose-950">{activity.title}</p>
                    <p className="mt-1 text-sm text-rose-700/75">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                  <Badge variant={activity.status === "ACTIVE" ? "success" : "warning"}>
                    {activity.status === "ACTIVE" ? "Active" : "Hidden"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Komentar Terbaru</p>
              <h2 className="mt-2 font-display text-3xl text-rose-950">Aktivitas user</h2>
            </div>
            <Link href="/admin/comments" className="text-sm font-semibold text-rose-600">
              Kelola komentar
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {overview.latestComments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-[24px] border border-white/55 bg-white/80 p-4"
              >
                <p className="font-medium text-rose-950">{comment.userName}</p>
                <p className="mt-1 text-sm text-rose-700/75">{comment.content.title}</p>
                <p className="mt-3 text-sm leading-7 text-rose-800/80">
                  {comment.commentText}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
