import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <input
        className={cn(
          "field-shell w-full rounded-[26px] px-4 py-3.5 text-sm text-rose-950 outline-none transition duration-300 placeholder:text-rose-400/80 focus:-translate-y-0.5 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-200/50",
          error && "border-red-300 focus:ring-red-100",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
