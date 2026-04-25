import { Heart } from "lucide-react";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animated-shell glass-card soft-shine hover-glow relative overflow-hidden rounded-[36px] p-8 md:p-10">
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
