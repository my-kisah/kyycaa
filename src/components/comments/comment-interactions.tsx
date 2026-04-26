"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleCommentReactionAction } from "@/actions/comment-actions";
import { CommentForm } from "@/components/comments/comment-form";
import { Button } from "@/components/ui/button";

const REACTIONS = ["❤️", "👍", "🥺", "🔥"] as const;

export function CommentInteractions({
  commentId,
  contentId,
  slug,
  replyToName,
  currentUserId,
  reactions,
  canReply,
}: {
  commentId: string;
  contentId: string;
  slug: string;
  replyToName: string;
  currentUserId?: string;
  reactions: Array<{
    emoji: string;
    count: number;
    reactedByCurrentUser: boolean;
  }>;
  canReply: boolean;
}) {
  const [openReply, setOpenReply] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {REACTIONS.map((emoji) => {
          const current = reactions.find((item) => item.emoji === emoji);
          return (
            <Button
              key={emoji}
              variant={current?.reactedByCurrentUser ? "primary" : "secondary"}
              className="rounded-full px-3 py-2 text-xs"
              disabled={!currentUserId || isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await toggleCommentReactionAction({
                    commentId,
                    contentId,
                    slug,
                    emoji,
                  });

                  if (result.error) {
                    toast.error(result.error);
                    return;
                  }

                  toast.success(result.success ?? "Reaksi diperbarui.");
                })
              }
            >
              <span className="text-sm">{emoji}</span>
              <span>{current?.count ?? 0}</span>
            </Button>
          );
        })}

        {canReply ? (
          <Button
            variant="ghost"
            className="rounded-full px-4 py-2 text-xs"
            onClick={() => setOpenReply((value) => !value)}
          >
            {openReply ? "Tutup balasan" : "Balas komentar"}
          </Button>
        ) : null}
      </div>

      {openReply ? (
        <CommentForm
          contentId={contentId}
          slug={slug}
          parentId={commentId}
          replyToName={replyToName}
          compact
          onSuccess={() => setOpenReply(false)}
        />
      ) : null}
    </div>
  );
}
