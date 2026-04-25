"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { adminResetUserPasswordAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UserPasswordResetForm({
  userId,
}: {
  userId: string;
}) {
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3 md:flex-row md:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await adminResetUserPasswordAction({
            userId,
            newPassword: password,
          });
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success(result.success ?? "Password user berhasil diperbarui.");
          setPassword("");
        });
      }}
    >
      <Input
        type="password"
        placeholder="Password baru untuk user"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="md:max-w-xs"
      />
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Reset password"}
      </Button>
    </form>
  );
}
