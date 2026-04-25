"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addCommentAction } from "@/actions/comment-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({
  contentId,
  slug,
}: {
  contentId: string;
  slug: string;
}) {
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]">
      <h3 className="font-display text-3xl text-rose-950">Tinggalkan komentar</h3>
      <p className="mt-2 text-sm leading-7 text-rose-800/75">
        Bagikan kesan Anda dengan bahasa yang lembut. Maksimal 300 karakter.
      </p>
      <div className="mt-5">
        <Textarea
          placeholder="Tulis komentar Anda..."
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
              });
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success(result.success ?? "Komentar berhasil ditambahkan.");
              setComment("");
            })
          }
        >
          {isPending ? "Mengirim..." : "Kirim komentar"}
        </Button>
      </div>
    </div>
  );
}
