"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addCommentAction } from "@/actions/comment-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({
  contentId,
  slug,
  parentId,
  replyToName,
  compact = false,
  onSuccess,
}: {
  contentId: string;
  slug: string;
  parentId?: string;
  replyToName?: string;
  compact?: boolean;
  onSuccess?: () => void;
}) {
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={
        compact
          ? "rounded-[24px] border border-rose-100/90 bg-rose-50/80 p-4 shadow-[0_14px_36px_rgba(206,140,170,0.1)]"
          : "rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]"
      }
    >
      <h3 className={`text-rose-950 ${compact ? "text-2xl font-display" : "font-display text-3xl"}`}>
        {parentId ? "Tulis balasan" : "Tinggalkan komentar"}
      </h3>
      <p className="mt-2 text-sm leading-7 text-rose-800/75">
        {parentId && replyToName
          ? `Balas komentar ${replyToName} dengan bahasa yang tetap hangat. Maksimal 300 karakter.`
          : "Bagikan kesan Anda dengan bahasa yang lembut. Maksimal 300 karakter."}
      </p>
      <div className="mt-5">
        <Textarea
          placeholder={parentId ? "Tulis balasan Anda..." : "Tulis komentar Anda..."}
          maxLength={300}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-rose-600/80">{comment.length}/300 karakter</p>
        <Button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await addCommentAction({
                contentId,
                commentText: comment,
                slug,
                parentId,
              });
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success(result.success ?? "Komentar berhasil ditambahkan.");
              setComment("");
              onSuccess?.();
            })
          }
        >
          {isPending ? "Mengirim..." : parentId ? "Kirim balasan" : "Kirim komentar"}
        </Button>
      </div>
    </div>
  );
}
