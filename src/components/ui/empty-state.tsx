import { Heart } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[32px] border border-white/60 bg-white/70 px-8 py-14 text-center shadow-[0_28px_60px_rgba(206,140,170,0.12)] backdrop-blur-xl">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-500">
        <Heart className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold text-rose-950">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-rose-700/80">
        {description}
      </p>
    </div>
  );
}
