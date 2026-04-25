"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminCreateAdminAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  return (
    <form
      className="grid gap-4 rounded-[26px] border border-white/55 bg-white/80 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await adminCreateAdminAction(form);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success(result.success ?? "Akun admin berhasil dibuat.");
          setForm({ name: "", username: "", email: "", password: "" });
          router.refresh();
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-rose-900">Nama admin</label>
          <Input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Nama admin"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-rose-900">Username admin</label>
          <Input
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            placeholder="username_admin"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-rose-900">Email admin</label>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="admin@email.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-rose-900">Password admin</label>
          <Input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Minimal 8 karakter"
          />
        </div>
      </div>
      <div className="flex justify-start">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Membuat admin..." : "Tambah akun admin"}
        </Button>
      </div>
    </form>
  );
}
