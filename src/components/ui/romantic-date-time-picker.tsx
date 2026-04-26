"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  setHours,
  setMinutes,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const minuteOptions = [0, 15, 30, 45];

function snapMinute(minute: number) {
  return (
    minuteOptions.reduce((closest, current) =>
      Math.abs(current - minute) < Math.abs(closest - minute) ? current : closest,
    ) ?? 0
  );
}

function createInitialDate(value?: string) {
  if (!value) {
    const now = new Date();
    return setMinutes(setHours(now, now.getHours()), snapMinute(now.getMinutes()));
  }

  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return createInitialDate();
  }

  return setMinutes(parsed, snapMinute(parsed.getMinutes()));
}

export function RomanticDateTimePicker({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => createInitialDate(defaultValue));
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(createInitialDate(defaultValue)),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
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

  const displayValue = useMemo(
    () => format(selectedDate, "EEEE, dd MMMM yyyy '|' HH:mm", { locale: id }),
    [selectedDate],
  );

  const inputValue = useMemo(
    () => format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
    [selectedDate],
  );

  const calendarDays = useMemo(() => {
    const rangeStart = startOfWeek(startOfMonth(visibleMonth), { locale: id });
    const rangeEnd = endOfWeek(endOfMonth(visibleMonth), { locale: id });

    return eachDayOfInterval({
      start: rangeStart,
      end: rangeEnd,
    });
  }, [visibleMonth]);

  const currentHour = selectedDate.getHours();
  const currentMinute = selectedDate.getMinutes();

  return (
    <div className="space-y-2" ref={ref}>
      <label className="text-sm font-medium text-rose-900">{label}</label>
      <input type="hidden" name={name} value={inputValue} />

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="field-shell group flex w-full items-center justify-between rounded-[28px] border px-4 py-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-rose-200 focus-visible:-translate-y-0.5 focus-visible:border-rose-300 focus-visible:ring-4 focus-visible:ring-rose-200/50 focus-visible:outline-none"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-rose-400">
              <Sparkles className="h-3.5 w-3.5" />
              Momen Pilihan
            </div>
            <p className="mt-2 truncate text-sm text-rose-950 md:text-[15px]">
              {displayValue}
            </p>
          </div>
          <span className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-white/90 text-rose-500 shadow-[0_14px_28px_rgba(228,178,201,0.18)] transition duration-300 group-hover:border-rose-200 group-hover:bg-rose-50">
            <CalendarDays className="h-[18px] w-[18px]" />
          </span>
        </button>

        <div
          className={cn(
            "romantic-picker-panel absolute left-0 top-[calc(100%+14px)] z-40 origin-top overflow-hidden rounded-[30px] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,245,249,0.96))] p-4 shadow-[0_34px_70px_rgba(206,140,170,0.24)] backdrop-blur-xl lg:min-w-[780px]",
            open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-[24px] border border-white/70 bg-white/78 p-4 shadow-[0_16px_34px_rgba(214,152,178,0.1)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-400">
                    Kalender
                  </p>
                  <p className="mt-1 font-display text-2xl text-rose-950">
                    {format(visibleMonth, "MMMM yyyy", { locale: id })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleMonth((prev) => subMonths(prev, 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white/90 text-rose-500 transition duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleMonth((prev) => addMonths(prev, 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white/90 text-rose-500 transition duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                  <span key={day} className="py-1">
                    {day}
                  </span>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const active = isSameDay(day, selectedDate);
                  const inMonth = isSameMonth(day, visibleMonth);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => {
                        setSelectedDate((prev) => {
                          const withSameTime = setHours(day, prev.getHours());
                          return setMinutes(withSameTime, prev.getMinutes());
                        });
                      }}
                      className={cn(
                        "romantic-day-button flex h-12 items-center justify-center rounded-2xl border text-sm transition duration-300",
                        active
                          ? "border-transparent bg-[linear-gradient(135deg,#ef7ba5,#c16b9d)] text-white shadow-[0_14px_30px_rgba(193,107,157,0.28)]"
                          : inMonth
                            ? "border-rose-100 bg-white/80 text-rose-950 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50"
                            : "border-transparent bg-transparent text-rose-300 hover:border-rose-100 hover:bg-white/60",
                        isToday(day) && !active && "ring-2 ring-rose-100/80",
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,252,253,0.95),rgba(255,245,248,0.9))] p-4 shadow-[0_16px_34px_rgba(214,152,178,0.1)]">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-400">
                  <Clock3 className="h-3.5 w-3.5" />
                  Jam Kenangan
                </p>
                <p className="mt-1 text-sm leading-7 text-rose-800/80">
                  Pilih waktu yang paling menggambarkan suasana momen ini.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-rose-900">Pilih jam</p>
                <div className="grid max-h-44 grid-cols-4 gap-2 overflow-y-auto pr-1">
                  {Array.from({ length: 24 }, (_, index) => index).map((hour) => {
                    const active = hour === currentHour;

                    return (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => setSelectedDate((prev) => setHours(prev, hour))}
                        className={cn(
                          "rounded-2xl border px-3 py-2 text-sm transition duration-300",
                          active
                            ? "border-transparent bg-[linear-gradient(135deg,#ef7ba5,#c16b9d)] text-white shadow-[0_12px_26px_rgba(193,107,157,0.22)]"
                            : "border-rose-100 bg-white/80 text-rose-900 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50",
                        )}
                      >
                        {hour.toString().padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-rose-900">Pilih menit</p>
                <div className="grid grid-cols-4 gap-2">
                  {minuteOptions.map((minute) => {
                    const active = minute === currentMinute;

                    return (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => setSelectedDate((prev) => setMinutes(prev, minute))}
                        className={cn(
                          "rounded-2xl border px-3 py-2 text-sm transition duration-300",
                          active
                            ? "border-transparent bg-[linear-gradient(135deg,#f5b5cc,#d980a8)] text-white shadow-[0_12px_26px_rgba(217,128,168,0.18)]"
                            : "border-rose-100 bg-white/80 text-rose-900 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50",
                        )}
                      >
                        {minute.toString().padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between rounded-[22px] border border-rose-100 bg-white/80 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-400">
                    Dipilih
                  </p>
                  <p className="mt-1 text-sm text-rose-950">
                    {format(selectedDate, "dd MMM yyyy '|' HH:mm", { locale: id })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef7ba5,#c16b9d)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(193,107,157,0.26)] transition duration-300 hover:-translate-y-0.5"
                >
                  <Check className="h-4 w-4" />
                  Gunakan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
