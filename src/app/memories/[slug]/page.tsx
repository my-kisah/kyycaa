import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, CalendarDays, Eye, ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlexibleImage } from "@/components/ui/flexible-image";
import { CopyLinkButton } from "@/components/memories/copy-link-button";
import { FullImageViewer } from "@/components/memories/full-image-viewer";
import { ViewTracker } from "@/components/memories/view-tracker";
import { getActivityBySlug } from "@/lib/data";
import { displayTags, formatCompactNumber, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;
  const activity = await getActivityBySlug(
    slug,
    session?.user?.role === "ADMIN",
  );

  if (!activity) {
    notFound();
  }

  const tags = displayTags(activity.tags);

  return (
    <div className="floating-hearts min-h-screen pb-16">
      <SiteHeader />
      <SiteShell className="space-y-8 py-12">
        <ViewTracker activityId={activity.id} />
        <div className="flex">
          <Link href="/dashboard">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Keluar dari detail cerita
            </Button>
          </Link>
        </div>
        <article className="overflow-hidden rounded-[38px] border border-white/60 bg-white/72 shadow-[0_30px_80px_rgba(206,140,170,0.14)]">
          <div className="relative h-[320px] md:h-[480px]">
            <FlexibleImage
              src={activity.imageUrl}
              alt={activity.title}
              fill
              loading="eager"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rose-950/30 via-rose-950/5 to-transparent" />
          </div>
          <div className="space-y-6 p-8 md:p-10">
            <div className="flex flex-wrap gap-3">
              <Badge>{activity.category}</Badge>
              <Badge variant={activity.status === "ACTIVE" ? "success" : "warning"}>
                {activity.status === "ACTIVE" ? "Active" : "Hidden"}
              </Badge>
              {tags.map((tag) => (
                <Badge key={tag} variant="default">
                  #{tag}
                </Badge>
              ))}
            </div>
            <div>
              <h1 className="font-display text-5xl leading-tight text-rose-950 md:text-6xl">
                {activity.title}
              </h1>
              <div className="mt-5 flex flex-wrap gap-5 text-sm text-rose-700/80">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(activity.date, "dd MMMM yyyy, HH:mm")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {formatCompactNumber(activity.views)} views
                </span>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {formatCompactNumber(activity.commentsCount)} komentar
                </span>
              </div>
              <div className="mt-5">
                <div className="flex flex-wrap gap-3">
                  <CopyLinkButton slug={activity.slug} />
                  <FullImageViewer imageUrl={activity.imageUrl} title={activity.title} />
                </div>
              </div>
            </div>
            <p className="max-w-4xl text-base leading-9 text-rose-800/88 md:text-lg">
              {activity.description}
            </p>
          </div>
        </article>

        {session?.user ? (
          <CommentForm contentId={activity.id} slug={activity.slug} />
        ) : (
          <div className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_20px_44px_rgba(206,140,170,0.12)]">
            <h3 className="font-display text-3xl text-rose-950">Ingin ikut berkomentar?</h3>
            <p className="mt-2 text-sm leading-7 text-rose-800/75">
              Anda perlu login terlebih dahulu untuk menambahkan komentar.
            </p>
            <div className="mt-5 flex gap-3">
              <Link href="/login">
                <Button>Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary">Register</Button>
              </Link>
            </div>
          </div>
        )}

        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Komentar</p>
            <h2 className="mt-2 font-display text-4xl text-rose-950">
              Respon untuk momen ini
            </h2>
          </div>
          {activity.comments.length ? (
            <CommentList comments={activity.comments} contentId={activity.id} slug={activity.slug} />
          ) : (
            <EmptyState
              title="Belum ada komentar"
              description="Jadilah orang pertama yang meninggalkan komentar untuk kenangan ini."
            />
          )}
        </section>
      </SiteShell>
    </div>
  );
}
