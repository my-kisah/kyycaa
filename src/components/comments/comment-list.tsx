import Image from "next/image";
import { auth } from "@/auth";
import { deleteCommentByPayloadAction } from "@/actions/comment-actions";
import { ConfirmDialogButton } from "@/components/ui/confirm-dialog-button";
import { getInitials } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export async function CommentList({
  comments,
  contentId,
  slug,
}: {
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    userPhoto: string | null;
    commentText: string;
    createdAt: Date;
  }>;
  contentId: string;
  slug: string;
}) {
  const session = await auth();

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const canDelete =
          session?.user?.role === "ADMIN" || session?.user?.id === comment.userId;

        return (
          <div
            key={comment.id}
            className="rounded-[28px] border border-white/60 bg-white/72 p-5 shadow-[0_18px_40px_rgba(206,140,170,0.1)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {comment.userPhoto ? (
                  <Image
                    src={comment.userPhoto}
                    alt={comment.userName}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f4abc4,#bf77a0)] text-sm font-semibold text-white">
                    {getInitials(comment.userName)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-rose-950">{comment.userName}</p>
                  <p className="text-xs text-rose-600/80">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
              </div>
              {canDelete ? (
                <ConfirmDialogButton
                  title="Hapus komentar?"
                  description="Komentar yang dihapus tidak bisa dipulihkan kembali."
                  confirmLabel="Hapus"
                  triggerLabel="Hapus"
                  action={deleteCommentByPayloadAction}
                  payload={JSON.stringify({
                    commentId: comment.id,
                    contentId,
                    slug,
                  })}
                />
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-8 text-rose-800/85">{comment.commentText}</p>
          </div>
        );
      })}
    </div>
  );
}
