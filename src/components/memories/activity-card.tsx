import Link from "next/link";
import { CalendarDays, Eye, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FlexibleImage } from "@/components/ui/flexible-image";
import { formatCompactNumber, formatDate } from "@/lib/utils";

type ActivityCardProps = {
  activity: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    imageUrl: string;
    date: Date;
    category: string;
    views: number;
    commentsCount: number;
    status?: "ACTIVE" | "HIDDEN";
  };
  adminMode?: boolean;
};

export function ActivityCard({ activity, adminMode = false }: ActivityCardProps) {
  return (
    <article className="animated-shell hover-glow group overflow-hidden rounded-[30px] border border-white/60 bg-white/72 shadow-[0_24px_60px_rgba(206,140,170,0.13)] backdrop-blur-xl transition duration-500 hover:-translate-y-1.5">
      <div className="relative h-64 overflow-hidden">
        <FlexibleImage
          src={activity.imageUrl}
          alt={activity.title}
          fill
          loading="eager"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-950/25 via-transparent to-transparent" />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{activity.category}</Badge>
          {adminMode && activity.status ? (
            <Badge variant={activity.status === "ACTIVE" ? "success" : "warning"}>
              {activity.status === "ACTIVE" ? "Active" : "Hidden"}
            </Badge>
          ) : null}
        </div>
        <div>
          <h3 className="font-display text-3xl leading-tight text-rose-950 transition duration-300 group-hover:text-rose-700">
            {activity.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-rose-800/80">
            {activity.excerpt}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-rose-700/80">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatDate(activity.date)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {formatCompactNumber(activity.views)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {formatCompactNumber(activity.commentsCount)}
          </span>
        </div>
        <Link
          href={`/memories/${activity.slug}`}
          className="inline-flex items-center rounded-full border border-rose-200/90 bg-white/80 px-4 py-2.5 text-sm font-semibold text-rose-600 shadow-[0_12px_28px_rgba(206,140,170,0.08)] transition hover:translate-x-1 hover:border-rose-300 hover:bg-rose-50/90 hover:text-rose-800"
        >
          Buka detail cerita
        </Link>
      </div>
    </article>
  );
}
