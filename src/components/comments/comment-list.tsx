import { auth } from "@/auth";
import { deleteCommentByPayloadAction } from "@/actions/comment-actions";
import { CommentInteractions } from "@/components/comments/comment-interactions";
import { ConfirmDialogButton } from "@/components/ui/confirm-dialog-button";
import { FlexibleImage } from "@/components/ui/flexible-image";
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
    reactions: Array<{
      id: string;
      emoji: string;
      userId: string;
    }>;
    replies: Array<{
      id: string;
      userId: string;
      userName: string;
      userPhoto: string | null;
      commentText: string;
      createdAt: Date;
      reactions: Array<{
        id: string;
        emoji: string;
        userId: string;
      }>;
    }>;
  }>;
  contentId: string;
  slug: string;
}) {
  const session = await auth();

  function buildReactionSummary(
    reactions: Array<{
      emoji: string;
      userId: string;
    }>,
  ) {
    return ["❤️", "👍", "🥺", "🔥"].map((emoji) => ({
      emoji,
      count: reactions.filter((reaction) => reaction.emoji === emoji).length,
      reactedByCurrentUser: reactions.some(
        (reaction) =>
          reaction.emoji === emoji && reaction.userId === session?.user?.id,
      ),
    }));
  }

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
                  <FlexibleImage
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
            <CommentInteractions
              commentId={comment.id}
              contentId={contentId}
              slug={slug}
              replyToName={comment.userName}
              currentUserId={session?.user?.id}
              reactions={buildReactionSummary(comment.reactions)}
              canReply={Boolean(session?.user)}
            />

            {comment.replies.length ? (
              <div className="mt-5 space-y-3 border-l border-rose-100 pl-4 md:pl-6">
                {comment.replies.map((reply) => {
                  const canDeleteReply =
                    session?.user?.role === "ADMIN" || session?.user?.id === reply.userId;

                  return (
                    <div
                      key={reply.id}
                      className="rounded-[24px] border border-rose-100/90 bg-rose-50/70 p-4 shadow-[0_12px_28px_rgba(206,140,170,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {reply.userPhoto ? (
                            <FlexibleImage
                              src={reply.userPhoto}
                              alt={reply.userName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f4abc4,#bf77a0)] text-xs font-semibold text-white">
                              {getInitials(reply.userName)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-rose-950">{reply.userName}</p>
                            <p className="text-xs text-rose-600/80">
                              {formatDistanceToNow(new Date(reply.createdAt), {
                                addSuffix: true,
                                locale: id,
                              })}
                            </p>
                          </div>
                        </div>
                        {canDeleteReply ? (
                          <ConfirmDialogButton
                            title="Hapus balasan?"
                            description="Balasan yang dihapus tidak bisa dipulihkan kembali."
                            confirmLabel="Hapus"
                            triggerLabel="Hapus"
                            action={deleteCommentByPayloadAction}
                            payload={JSON.stringify({
                              commentId: reply.id,
                              contentId,
                              slug,
                            })}
                          />
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-rose-800/85">{reply.commentText}</p>
                      <CommentInteractions
                        commentId={reply.id}
                        contentId={contentId}
                        slug={slug}
                        replyToName={reply.userName}
                        currentUserId={session?.user?.id}
                        reactions={buildReactionSummary(reply.reactions)}
                        canReply={false}
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
