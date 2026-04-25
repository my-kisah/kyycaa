"use client";

import Image from "next/image";
import { useState } from "react";
import { Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FullImageViewer({
  imageUrl,
  title,
}: {
  imageUrl: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" className="gap-2" onClick={() => setOpen(true)}>
        <Expand className="h-4 w-4" />
        Lihat foto penuh
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-rose-950/78 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-6xl">
            <button
              type="button"
              aria-label="Tutup foto"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-rose-950 shadow-[0_16px_36px_rgba(0,0,0,0.18)]"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="overflow-hidden rounded-[32px] border border-white/20 bg-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.26)]">
              <div className="relative h-[70vh] min-h-[320px] w-full">
                <Image src={imageUrl} alt={title} fill className="object-contain bg-black/10" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
