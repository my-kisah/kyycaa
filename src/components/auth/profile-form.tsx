"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { FlexibleImage } from "@/components/ui/flexible-image";
import { Input } from "@/components/ui/input";

export function ProfileForm({
  initialValues,
}: {
  initialValues: {
    name: string;
    username: string;
    email: string;
    image: string;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initialValues);
  const [preview, setPreview] = useState(initialValues.image);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <form
      className="space-y-5 rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)]"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await updateProfileAction(formData);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success(result.success ?? "Profil berhasil diperbarui.");
          router.refresh();
        });
      }}
    >
      <div>
        <h2 className="font-display text-3xl text-rose-950">Profil Saya</h2>
        <p className="mt-2 text-sm leading-7 text-rose-800/78">
          Ubah nama, username, email, dan foto profil Anda kapan saja.
        </p>
      </div>

      <input type="hidden" name="currentImage" value={form.image} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-rose-900">Nama</label>
          <Input
            name="name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-rose-900">Username</label>
          <Input
            name="username"
            value={form.username}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-rose-900">Email</label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-rose-900">Upload foto profil</label>
          <Input
            type="file"
            name="image"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                setPreview(form.image);
                return;
              }

              const objectUrl = URL.createObjectURL(file);
              setPreview((prev) => {
                if (prev.startsWith("blob:")) {
                  URL.revokeObjectURL(prev);
                }
                return objectUrl;
              });
            }}
          />
          <p className="text-xs text-rose-700/70">
            Gunakan JPG, PNG, atau WEBP dengan ukuran maksimal 4MB.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-rose-900">Preview foto profil</p>
        {preview ? (
          <div className="relative h-36 w-36 overflow-hidden rounded-full border border-white/60 bg-rose-50 shadow-[0_18px_40px_rgba(206,140,170,0.14)]">
            <FlexibleImage
              src={preview}
              alt="Preview foto profil"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-rose-200 bg-[linear-gradient(135deg,rgba(255,248,250,0.9),rgba(252,238,244,0.75))] text-center text-sm text-rose-600/80">
            Belum ada foto profil
          </div>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan profil"}
      </Button>
    </form>
  );
}
