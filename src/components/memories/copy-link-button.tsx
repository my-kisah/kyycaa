"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ slug }: { slug: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const url = `${window.location.origin}/memories/${slug}`;
          await navigator.clipboard.writeText(url);
          toast.success("Link konten berhasil disalin.");
        })
      }
    >
      {isPending ? "Menyalin..." : "Copy Link"}
    </Button>
  );
}
