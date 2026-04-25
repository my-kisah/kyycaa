"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminBanUserAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UserBanForm({
  userId,
  banned,
  initialReason,
}: {
  userId: string;
  banned: boolean;
  initialReason?: string | null;
}) {
  const router = useRouter();
  const [reason, setReason] = useState(initialReason ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await adminBanUserAction({
            userId,
            reason,
          });

          if (result.error) {
            toast.error(result.error);
            return;
          }

          toast.success(result.success ?? "Status akun berhasil diperbarui.");
          if (!banned) {
            setReason("");
          }
          router.refresh();
        });
      }}
    >
      {!banned ? (
        <Input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Alasan pembekuan akun"
          className="md:max-w-xs"
        />
      ) : (
        <p className="max-w-sm rounded-[18px] border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-800">
          Akun dibekukan. Alasan: {initialReason ?? "Tidak ada alasan yang ditulis admin."}
        </p>
      )}
      <Button type="submit" variant={banned ? "secondary" : "danger"} disabled={isPending}>
        {isPending ? "Memproses..." : banned ? "Buka pembekuan" : "Bekukan akun"}
      </Button>
    </form>
  );
}
