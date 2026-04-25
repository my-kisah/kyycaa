"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ConfirmDialogButton({
  title,
  description,
  confirmLabel,
  triggerLabel,
  variant = "danger",
  action,
  payload,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  triggerLabel: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  action: (payload: string) => Promise<{ success?: string; error?: string }>;
  payload: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button variant={variant} className="px-4 py-2 text-xs" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-rose-950/25 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] border border-white/60 bg-[rgba(255,248,251,0.95)] p-6 shadow-[0_30px_80px_rgba(65,38,56,0.2)]">
            <h3 className="font-display text-3xl text-rose-950">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-rose-700/85">{description}</p>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await action(payload);
                    if (result.error) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success(result.success ?? "Aksi berhasil.");
                    setOpen(false);
                    router.refresh();
                  })
                }
              >
                {isPending ? "Memproses..." : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
