import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { Badge } from "@/components/ui/badge";
import { getAdminAnalytics } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const analytics = await getAdminAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Analisis</p>
        <h1 className="mt-2 font-display text-4xl text-rose-950">Insight konten populer</h1>
      </div>

      <AnalyticsCharts
        viewsData={analytics.activities.map((item) => ({
          title: item.title,
          views: item.views,
        }))}
        commentsData={analytics.activities.map((item) => ({
          title: item.title,
          commentsCount: item.commentsCount,
        }))}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]">
          <h2 className="font-display text-3xl text-rose-950">Paling banyak dilihat</h2>
          <div className="mt-6 space-y-4">
            {analytics.topViewed.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/55 bg-white/80 p-4">
                <p className="font-medium text-rose-950">{item.title}</p>
                <p className="mt-2 text-sm text-rose-700/80">{item.views} views</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]">
          <h2 className="font-display text-3xl text-rose-950">Paling banyak dikomentari</h2>
          <div className="mt-6 space-y-4">
            {analytics.topCommented.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/55 bg-white/80 p-4">
                <p className="font-medium text-rose-950">{item.title}</p>
                <p className="mt-2 text-sm text-rose-700/80">
                  {item.commentsCount} komentar
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]">
          <h2 className="font-display text-3xl text-rose-950">Engagement tertinggi</h2>
          <div className="mt-6 space-y-4">
            {analytics.highestEngagement.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/55 bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-rose-950">{item.title}</p>
                  <Badge>#{item.rank}</Badge>
                </div>
                <p className="mt-2 text-sm text-rose-700/80">
                  Score engagement {item.engagementScore}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
