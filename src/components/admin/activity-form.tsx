"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveActivityAction } from "@/actions/activity-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ActivityFormProps = {
  initialValues?: {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    tags: string;
    status: "ACTIVE" | "HIDDEN";
    imageUrl: string;
  };
};

export function ActivityForm({ initialValues }: ActivityFormProps) {
  const router = useRouter();
  const [preview, setPreview] = useState(initialValues?.imageUrl ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="relative space-y-8 rounded-[34px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,251,0.96))] p-6 shadow-[0_32px_80px_rgba(206,140,170,0.18)] md:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await saveActivityAction(formData);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success(result.success ?? "Konten berhasil disimpan.");
          router.push("/admin/content");
          router.refresh();
        });
      }}
    >
      <div className="ambient-orb orb-a" />
      <input type="hidden" name="id" defaultValue={initialValues?.id ?? ""} />

      <div className="relative grid gap-8">
        <section className="rounded-[30px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,249,251,0.98))] p-6 shadow-[0_24px_48px_rgba(208,148,170,0.14)]">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
              Informasi Utama
            </p>
            <h2 className="mt-3 font-display text-3xl text-rose-950">
              Susun cerita dengan detail yang lebih hidup
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-rose-900">Judul konten</label>
              <Input
                name="title"
                defaultValue={initialValues?.title}
                placeholder="Misalnya: Malam di bawah lampu kota"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-rose-900">Kategori</label>
              <Input
                name="category"
                defaultValue={initialValues?.category}
                placeholder="Date Night"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="text-sm font-medium text-rose-900">Deskripsi lengkap</label>
            <Textarea
              name="description"
              defaultValue={initialValues?.description}
              placeholder="Tulis cerita lengkap yang ingin dipublikasikan..."
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[30px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,249,251,0.98))] p-6 shadow-[0_24px_48px_rgba(208,148,170,0.14)]">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
                Detail Publikasi
              </p>
              <h3 className="mt-3 font-display text-3xl text-rose-950">
                Atur momen, tag, dan visibilitas
              </h3>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-rose-900">Tanggal kegiatan</label>
                <Input type="datetime-local" name="date" defaultValue={initialValues?.date} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-rose-900">Tags</label>
                <Input
                  name="tags"
                  defaultValue={initialValues?.tags}
                  placeholder="romantis, dinner, sunset"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-rose-900">Status</label>
                <select
                  name="status"
                  defaultValue={initialValues?.status ?? "ACTIVE"}
                  className="field-shell w-full rounded-[26px] px-4 py-3.5 text-sm text-rose-950 outline-none transition duration-300 focus:-translate-y-0.5 focus:ring-4 focus:ring-rose-200/50"
                >
                  <option value="ACTIVE">Publish / Active</option>
                  <option value="HIDDEN">Simpan sebagai Hidden</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,249,251,0.98))] p-6 shadow-[0_24px_48px_rgba(208,148,170,0.14)]">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
                Visual Utama
              </p>
              <h3 className="mt-3 font-display text-3xl text-rose-950">
                Pilih gambar yang memperkuat suasana
              </h3>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-rose-900">Upload gambar</label>
              <Input
                type="file"
                name="image"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const objectUrl = URL.createObjectURL(file);
                  setPreview(objectUrl);
                }}
              />
              {preview ? (
                <div className="rise-card relative h-72 overflow-hidden rounded-[30px] border border-white/60 bg-rose-50">
                  <Image src={preview} alt="Preview gambar" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-[30px] border border-dashed border-rose-200 bg-[linear-gradient(135deg,rgba(255,248,250,0.9),rgba(252,238,244,0.75))] text-sm text-rose-600/80">
                  Preview gambar akan muncul di sini.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="relative flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : initialValues ? "Simpan perubahan" : "Publish konten"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Batalkan
        </Button>
      </div>
    </form>
  );
}
