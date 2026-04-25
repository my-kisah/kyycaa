import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[linear-gradient(135deg,#ef7ba5,#c16b9d)] text-white shadow-[0_18px_40px_rgba(193,107,157,0.28)] hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(193,107,157,0.34)]",
        variant === "secondary" &&
          "border border-white/50 bg-white/70 text-rose-900 shadow-[0_18px_40px_rgba(208,148,170,0.12)] backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white",
        variant === "ghost" &&
          "border border-transparent bg-transparent text-rose-900 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-white/50",
        variant === "danger" &&
          "bg-[linear-gradient(135deg,#f16f7f,#d34563)] text-white shadow-[0_18px_36px_rgba(211,69,99,0.24)] hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(211,69,99,0.3)]",
          className,
        )}
      {...props}
    />
  );
}
