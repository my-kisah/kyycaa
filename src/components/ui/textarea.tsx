import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      <textarea
        className={cn(
          "field-shell min-h-36 w-full rounded-[28px] px-4 py-3.5 text-sm text-rose-950 outline-none transition duration-300 placeholder:text-rose-400/80 focus:-translate-y-0.5 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-200/50",
          error && "border-red-300 focus:ring-red-100",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
