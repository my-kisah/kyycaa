"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectOption = {
  value: string;
  label: string;
};

export function SelectMenu({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [renderMenu, setRenderMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setRenderMenu(true);
      return;
    }

    if (!renderMenu) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setRenderMenu(false);
    }, 240);

    return () => window.clearTimeout(timeout);
  }, [open, renderMenu]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (!ref.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    function updateMenuPosition() {
      const button = buttonRef.current;
      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 12,
        left: rect.left,
        width: rect.width,
      });
    }

    if (!open) {
      return;
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  const selected =
    options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className={cn("space-y-2", open ? "relative z-40" : "relative z-10", className)}
      ref={ref}
    >
      <label className="pl-2 text-sm font-medium text-rose-900">{label}</label>
      <div className="relative rounded-[30px] border border-rose-200/90 bg-white/80 p-1.5 shadow-[0_18px_36px_rgba(206,140,170,0.1)] backdrop-blur-xl">
        <button
          type="button"
          ref={buttonRef}
          className="field-shell flex w-full items-center justify-between rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,247,250,0.94))] px-5 py-3.5 text-left text-sm text-rose-950 outline-none transition duration-300 hover:-translate-y-0.5 hover:border-rose-200 focus:-translate-y-0.5 focus:border-rose-300 focus:ring-4 focus:ring-rose-200/50"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="truncate">{selected?.label}</span>
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-rose-100 bg-white/90 text-rose-500 shadow-[0_10px_20px_rgba(226,170,194,0.16)] transition duration-300",
              open && "border-rose-200 bg-rose-50 text-rose-600",
            )}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition duration-300",
                open && "rotate-180",
              )}
            />
          </span>
        </button>
      </div>
      {mounted && renderMenu && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              className={cn(
                "select-menu-popover fixed z-[120] overflow-hidden rounded-[28px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,247,250,0.96))] p-1.5 shadow-[0_28px_52px_rgba(206,140,170,0.18)] backdrop-blur-xl",
                open ? "is-open" : "is-closing",
              )}
              style={{
                top: menuStyle.top,
                left: menuStyle.left,
                width: menuStyle.width,
              }}
            >
              <div
                className={cn(
                  "select-menu-panel max-h-72 overflow-y-auto rounded-[22px] border border-white/70 bg-white/70 p-2",
                  open ? "is-open" : "is-closing",
                )}
                role="listbox"
                aria-label={label}
              >
                {options.map((option) => {
                  const active = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "select-menu-item mb-1 flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left text-sm transition duration-200 last:mb-0",
                        active
                          ? "border-transparent bg-[linear-gradient(135deg,#f6a7c3,#d685ad)] text-white shadow-[0_10px_24px_rgba(214,133,173,0.24)]"
                          : "border-transparent text-rose-900 hover:border-rose-100 hover:bg-rose-50/90",
                      )}
                      style={{ transitionDelay: open ? `${Math.min(options.indexOf(option) * 28, 140)}ms` : "0ms" }}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {active ? <Check className="h-4 w-4" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
