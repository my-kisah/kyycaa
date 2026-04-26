import Link from "next/link";
import { deleteCommentByPayloadAction } from "@/actions/comment-actions";
import { ConfirmDialogButton } from "@/components/ui/confirm-dialog-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCommentAdminList } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ contentId?: string }>;
}) {
  const params = await searchParams;
  const [comments, activities] = await Promise.all([
    getCommentAdminList(params.contentId),
    prisma.activity.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]">
        <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Komentar</p>
        <h1 className="mt-2 font-display text-4xl text-rose-950">Moderasi komentar user</h1>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/admin/comments" className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm">
            Semua komentar
          </Link>
          {activities.map((activity) => (
            <Link
              key={activity.id}
              href={`/admin/comments?contentId=${activity.id}`}
              className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm"
            >
              {activity.title}
            </Link>
          ))}
        </div>
      </div>

      {comments.length ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-[28px] border border-white/60 bg-white/72 p-6 shadow-[0_20px_44px_rgba(206,140,170,0.12)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <p className="font-medium text-rose-950">{comment.userName}</p>
                  <p className="text-sm text-rose-700/75">
                    Pada konten{" "}
                    <span className="font-semibold">{comment.content.title}</span>
                  </p>
                  <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
                    {formatDate(comment.createdAt, "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
                <ConfirmDialogButton
                  title="Hapus komentar?"
                  description="Komentar ini akan dihapus permanen dari detail konten dan dashboard admin."
                  confirmLabel="Hapus komentar"
                  triggerLabel="Hapus"
                  action={deleteCommentByPayloadAction}
                  payload={JSON.stringify({
                    commentId: comment.id,
                    contentId: comment.contentId,
                    slug: comment.content.slug,
                  })}
                />
              </div>
              <p className="mt-4 text-sm leading-8 text-rose-800/82">{comment.commentText}</p>
              {comment.replies.length ? (
                <div className="mt-4 space-y-3 border-l border-rose-100 pl-4">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-[22px] border border-rose-100/80 bg-rose-50/70 p-4"
                    >
                      <p className="font-medium text-rose-900">{reply.userName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-rose-500">
                        {formatDate(reply.createdAt, "dd MMM yyyy, HH:mm")}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-rose-800/82">{reply.commentText}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum ada komentar"
          description="Komentar user akan tampil di sini dan bisa difilter berdasarkan konten tertentu."
        />
      )}
    </div>
  );
}
