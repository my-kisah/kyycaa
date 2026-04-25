import { ActivityCard } from "@/components/memories/activity-card";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/section-heading";

export function LatestMemoriesSection({
  activities,
}: {
  activities: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    imageUrl: string;
    date: Date;
    category: string;
    views: number;
    commentsCount: number;
  }>;
}) {
  return (
    <section id="kenangan" className="py-20">
      <SiteShell className="space-y-10">
        <SectionHeading
          eyebrow="Kenangan Terbaru"
          title="Preview momen yang hangat, ringan, dan terasa personal."
          description="Guest bisa melihat cuplikan cerita terbaru yang tidak disembunyikan. Untuk ikut berkomentar dan mengakses dashboard lengkap, pengguna hanya perlu login."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </SiteShell>
    </section>
  );
}
