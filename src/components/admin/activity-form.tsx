"use client";

import { Sparkles } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveActivityAction } from "@/actions/activity-actions";
import { Button } from "@/components/ui/button";
import { FlexibleImage } from "@/components/ui/flexible-image";
import { Input } from "@/components/ui/input";
import { RomanticDateTimePicker } from "@/components/ui/romantic-date-time-picker";
import { SelectMenu } from "@/components/ui/select-menu";
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
  const [imageSource, setImageSource] = useState<"file" | "link">(
    initialValues?.imageUrl?.startsWith("http") ? "link" : "file",
  );
  const [imageUrlInput, setImageUrlInput] = useState(
    initialValues?.imageUrl?.startsWith("http") ? initialValues.imageUrl : "",
  );
  const [status, setStatus] = useState<"ACTIVE" | "HIDDEN">(initialValues?.status ?? "ACTIVE");
  const [isPending, startTransition] = useTransition();
  const statusDescription = useMemo(
    () =>
      status === "ACTIVE"
        ? "Konten akan langsung muncul di dashboard user setelah dipublikasikan."
        : "Konten disimpan lebih dulu dan tetap tersembunyi dari user biasa.",
    [status],
  );

  return (
    <form
      className="relative space-y-8 overflow-hidden rounded-[36px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,251,0.96))] p-6 shadow-[0_32px_80px_rgba(206,140,170,0.18)] md:p-8"
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
        <section className="group rounded-[32px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,249,251,0.98))] p-6 shadow-[0_24px_48px_rgba(208,148,170,0.14)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_rgba(208,148,170,0.18)]">
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
                Informasi Utama
              </p>
              <h2 className="mt-3 font-display text-3xl text-rose-950 md:text-[2.9rem]">
                Susun cerita dengan detail yang lebih hidup
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-rose-800/78 md:text-[15px]">
                Rangkai judul dan cerita dalam suasana yang lembut, rapi, dan mudah
                dibaca agar setiap momen terasa lebih personal saat dibuka kembali.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-500 shadow-[0_14px_28px_rgba(214,152,178,0.12)]">
              <Sparkles className="h-3.5 w-3.5" />
              Estetika Cerita
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-rose-900">Judul konten</label>
              <Input
                name="title"
                defaultValue={initialValues?.title}
                placeholder="Misalnya: Hujan kecil, lampu kota, dan percakapan yang ingin diulang"
                className="min-h-[68px] rounded-[30px] px-5 text-base md:text-lg"
              />
              <p className="pl-1 text-xs leading-6 text-rose-500/90">
                Gunakan judul yang puitis dan mudah diingat agar terasa lebih hidup saat dibaca kembali.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-rose-900">Kategori</label>
              <Input
                name="category"
                defaultValue={initialValues?.category}
                placeholder="Date Night"
                className="min-h-[68px] rounded-[30px] px-5 text-base"
              />
              <p className="pl-1 text-xs leading-6 text-rose-500/90">
                Contoh: Date Night, Anniversary, Catatan Hati, atau Momen Tenang.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <label className="text-sm font-medium text-rose-900">Deskripsi lengkap</label>
            <Textarea
              name="description"
              defaultValue={initialValues?.description}
              placeholder="Tulis cerita lengkap yang ingin dipublikasikan, biarkan momen ini memiliki ruang untuk bernapas dan dikenang..."
              className="min-h-[260px] rounded-[30px] px-5 py-5 text-[15px] leading-8 md:text-base"
            />
            <p className="pl-1 text-xs leading-6 text-rose-500/90">
              Tidak ada batas karakter untuk judul dan deskripsi, jadi Anda bisa menulis seutuh yang dibutuhkan.
            </p>
          </div>
        </section>

        <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
          <section className="group rounded-[32px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,249,251,0.98))] p-6 shadow-[0_24px_48px_rgba(208,148,170,0.14)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_rgba(208,148,170,0.18)]">
            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
                  Detail Publikasi
                </p>
                <h3 className="mt-3 font-display text-3xl text-rose-950 md:text-[2.7rem]">
                  Atur momen, tag, dan visibilitas
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-rose-800/78 md:text-[15px]">
                  Buat tampilan publikasi terasa lebih kurasi: waktunya jelas, tag-nya peka, dan statusnya mudah dipahami.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-[linear-gradient(135deg,rgba(252,241,245,0.9),rgba(255,255,255,0.88))] px-4 py-3 text-sm leading-7 text-rose-800/80 shadow-[0_12px_24px_rgba(214,152,178,0.1)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-400">
                  Status terpilih
                </p>
                <p className="mt-1 font-medium text-rose-950">
                  {status === "ACTIVE" ? "Publish / Active" : "Simpan sebagai Hidden"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 2xl:grid-cols-[1.06fr_0.94fr]">
              <RomanticDateTimePicker
                name="date"
                defaultValue={initialValues?.date}
                label="Tanggal kegiatan"
              />

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-rose-900">Tags</label>
                  <Input
                    name="tags"
                    defaultValue={initialValues?.tags}
                    placeholder="romantis, dinner, sunset"
                    className="min-h-[68px] rounded-[30px] px-5 text-base"
                  />
                  <p className="pl-1 text-xs leading-6 text-rose-500/90">
                    Pisahkan dengan koma untuk membantu konten lebih mudah ditemukan.
                  </p>
                </div>

                <div className="space-y-2">
                  <SelectMenu
                    label="Status"
                    value={status}
                    options={[
                      { value: "ACTIVE", label: "Publish / Active" },
                      { value: "HIDDEN", label: "Simpan sebagai Hidden" },
                    ]}
                    onChange={(value) => setStatus(value as "ACTIVE" | "HIDDEN")}
                  />
                  <input type="hidden" name="status" value={status} />
                  <div className="rounded-[24px] border border-rose-100/90 bg-white/78 px-4 py-3 text-sm leading-7 text-rose-800/80 shadow-[0_12px_28px_rgba(214,152,178,0.08)]">
                    {statusDescription}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="group rounded-[32px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,249,251,0.98))] p-6 shadow-[0_24px_48px_rgba(208,148,170,0.14)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_rgba(208,148,170,0.18)]">
            <div className="mb-7 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
                    Visual Utama
                  </p>
                  <h3 className="mt-3 font-display text-3xl text-rose-950 md:text-[2.7rem]">
                    Pilih gambar yang memperkuat suasana
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-rose-500 shadow-[0_14px_30px_rgba(214,152,178,0.1)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Visual Story
                </div>
              </div>
              <p className="max-w-xl text-sm leading-7 text-rose-800/78 md:text-[15px]">
                Gunakan visual yang lembut dan kuat secara suasana agar kartu kenangan terlihat estetik saat dibuka di dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-rose-900">Sumber gambar</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setImageSource("file")}
                    className={`rounded-[24px] border px-4 py-4 text-left transition duration-300 ${
                      imageSource === "file"
                        ? "border-rose-300 bg-[linear-gradient(135deg,rgba(248,205,222,0.45),rgba(255,255,255,0.95))] shadow-[0_16px_34px_rgba(214,152,178,0.12)]"
                        : "border-rose-100/90 bg-white/78 hover:border-rose-200 hover:bg-rose-50/70"
                    }`}
                  >
                    <p className="text-sm font-semibold text-rose-950">Upload file</p>
                    <p className="mt-1 text-xs leading-6 text-rose-700/78">
                      Cocok untuk unggah langsung JPG, PNG, atau WEBP maksimal 4MB.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSource("link")}
                    className={`rounded-[24px] border px-4 py-4 text-left transition duration-300 ${
                      imageSource === "link"
                        ? "border-rose-300 bg-[linear-gradient(135deg,rgba(248,205,222,0.45),rgba(255,255,255,0.95))] shadow-[0_16px_34px_rgba(214,152,178,0.12)]"
                        : "border-rose-100/90 bg-white/78 hover:border-rose-200 hover:bg-rose-50/70"
                    }`}
                  >
                    <p className="text-sm font-semibold text-rose-950">Gunakan link</p>
                    <p className="mt-1 text-xs leading-6 text-rose-700/78">
                      Lebih hemat database karena memakai URL gambar yang sudah online.
                    </p>
                  </button>
                </div>
              </div>

              {imageSource === "file" ? (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-rose-900">Upload gambar</label>
                  <Input
                    type="file"
                    name="image"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="min-h-[66px] rounded-[30px] px-5 text-sm"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const objectUrl = URL.createObjectURL(file);
                      setPreview(objectUrl);
                    }}
                  />
                  <p className="text-xs leading-6 text-rose-500/90">
                    Format yang didukung: JPG, PNG, dan WEBP dengan ukuran maksimal 4MB.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-rose-900">Link gambar</label>
                  <Input
                    type="url"
                    name="imageUrl"
                    value={imageUrlInput}
                    placeholder="https://contoh-domain.com/gambar-romantis.jpg"
                    className="min-h-[66px] rounded-[30px] px-5 text-sm"
                    onChange={(event) => {
                      const value = event.target.value;
                      setImageUrlInput(value);
                      setPreview(value.trim());
                    }}
                  />
                  <p className="text-xs leading-6 text-rose-500/90">
                    Gunakan link `http` atau `https` agar gambar bisa dipakai tanpa membebani database.
                  </p>
                </div>
              )}

              {imageSource === "file" ? (
                <input type="hidden" name="imageUrl" value="" />
              ) : (
                <input type="hidden" name="imageUrl" value={imageUrlInput} />
              )}

              {preview ? (
                <div className="rise-card relative h-80 overflow-hidden rounded-[32px] border border-white/60 bg-rose-50 shadow-[0_24px_48px_rgba(206,140,170,0.16)]">
                  <FlexibleImage
                    src={preview}
                    alt="Preview gambar"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="flex h-80 items-center justify-center rounded-[32px] border border-dashed border-rose-200 bg-[linear-gradient(135deg,rgba(255,248,250,0.9),rgba(252,238,244,0.75))] px-8 text-center text-sm leading-8 text-rose-600/80">
                  Preview gambar akan muncul di sini dengan bingkai yang lebih lembut dan siap tampil di halaman kenangan.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="relative flex flex-wrap items-center gap-3 rounded-[28px] border border-white/70 bg-white/72 px-5 py-4 shadow-[0_18px_34px_rgba(214,152,178,0.12)] backdrop-blur-xl">
          <div className="mr-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-400">
              Siap Dipublikasikan
            </p>
            <p className="mt-1 text-sm text-rose-800/80">
              Pastikan cerita, waktu, dan visualnya sudah terasa pas sebelum dipublikasikan.
            </p>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : initialValues ? "Simpan perubahan" : "Publish konten"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Batalkan
          </Button>
        </div>
      </div>
    </form>
  );
}
