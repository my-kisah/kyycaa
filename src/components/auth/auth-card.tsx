import Link from "next/link";
import { ChevronLeft, Heart } from "lucide-react";

export function AuthCard({
  title,
  description,
  children,
  backHref,
  backLabel = "Kembali",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="animated-shell glass-card soft-shine hover-glow relative overflow-hidden rounded-[36px] p-8 md:p-10">
      {backHref ? (
        <Link
          href={backHref}
          className="auth-back-pill group mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/78 px-4 py-2 text-sm font-semibold text-rose-800 shadow-[0_14px_30px_rgba(214,152,178,0.15)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-100 bg-rose-50/90 text-rose-500 transition duration-300 group-hover:border-rose-200 group-hover:bg-rose-100">
            <ChevronLeft className="h-4 w-4" />
          </span>
          <span>{backLabel}</span>
        </Link>
      ) : null}
      <div className="float-gentle mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f7adc7,#cf7ca2)] text-white shadow-[0_18px_40px_rgba(207,124,162,0.25)]">
        <Heart className="h-6 w-6" />
      </div>
      <h1 className="shimmer-text font-display text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 text-sm leading-8 text-rose-800/80 md:text-base">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
