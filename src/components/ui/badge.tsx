import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-xl",
        variant === "default" &&
          "border-rose-200 bg-white/65 text-rose-700",
        variant === "success" &&
          "border-emerald-200 bg-emerald-50/80 text-emerald-700",
        variant === "warning" &&
          "border-amber-200 bg-amber-50/80 text-amber-700",
        variant === "danger" &&
          "border-rose-200 bg-rose-50/80 text-rose-700",
      )}
    >
      {children}
    </span>
  );
}
