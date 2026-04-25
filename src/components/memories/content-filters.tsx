"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";

export function ContentFilters({
  categories,
  months,
}: {
  categories: string[];
  months: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="relative z-20 rounded-[34px] border border-rose-200/90 bg-white/86 p-3 shadow-[0_20px_44px_rgba(206,140,170,0.1)] backdrop-blur-xl">
      <div className="grid gap-4 rounded-[28px] border border-rose-100/90 bg-[rgba(255,250,252,0.82)] p-4 md:grid-cols-[1.5fr_0.8fr_0.8fr]">
      <div className="space-y-2">
        <label className="pl-2 text-sm font-medium text-rose-900">Cari konten</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
          <Input
            placeholder="Judul, kategori, atau suasana..."
            className="rounded-full border-rose-200/90 bg-white/95 pl-10"
            defaultValue={searchParams.get("search") ?? ""}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateParam("search", (event.target as HTMLInputElement).value);
              }
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <SelectMenu
          label="Kategori"
          value={searchParams.get("category") ?? "all"}
          onChange={(value) => updateParam("category", value)}
          options={[
            { value: "all", label: "Semua kategori" },
            ...categories.map((category) => ({
              value: category,
              label: category,
            })),
          ]}
        />
      </div>
      <div className="space-y-2">
        <SelectMenu
          label="Bulan"
          value={searchParams.get("month") ?? "all"}
          onChange={(value) => updateParam("month", value)}
          options={[
            { value: "all", label: "Semua bulan" },
            ...months.map((month) => ({
              value: month,
              label: month,
            })),
          ]}
        />
      </div>
      </div>
    </div>
  );
}
