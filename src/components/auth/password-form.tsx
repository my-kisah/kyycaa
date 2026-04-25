"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { changePasswordAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  return (
    <form
      className="space-y-5 rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await changePasswordAction(form);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success(result.success ?? "Password berhasil diubah.");
          setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        });
      }}
    >
      <div>
        <h2 className="font-display text-3xl text-rose-950">Ganti Password</h2>
        <p className="mt-2 text-sm leading-7 text-rose-800/78">
          Masukkan password saat ini lalu tentukan password baru yang lebih aman.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-900">Password saat ini</label>
        <Input
          type="password"
          value={form.currentPassword}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, currentPassword: event.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-900">Password baru</label>
        <Input
          type="password"
          value={form.newPassword}
          onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-900">Konfirmasi password baru</label>
        <Input
          type="password"
          value={form.confirmPassword}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
          }
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Memperbarui..." : "Perbarui password"}
      </Button>
    </form>
  );
}
