"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getAvailableSlots } from "../actions";

// ── Calendar helpers ───────────────────────────────────────────────────────────

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatSlot(slot: string, locale: string) {
  const [h, m] = slot.split(":").map(Number);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, h, m));
}

// ── MiniCalendar ──────────────────────────────────────────────────────────────

interface CalendarProps {
  selectedDate: string;
  onSelect: (dateStr: string) => void;
  locale: string;
}

function MiniCalendar({ selectedDate, onSelect, locale }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(() => {
    const d = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const monthLabel = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prevMonth() {
    setViewMonth(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewMonth(new Date(year, month + 1, 1));
  }

  const selectedD = selectedDate ? new Date(selectedDate + "T00:00:00") : null;

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
        <span className="text-sm font-semibold text-slate-800 capitalize">
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;

          const cellDate = new Date(year, month, day);
          const isPast = cellDate < today;
          const isToday = sameDay(cellDate, today);
          const isSel = selectedD && sameDay(cellDate, selectedD);

          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => onSelect(isoDate(cellDate))}
              className={cn(
                "h-8 w-8 mx-auto rounded-full text-sm transition-all",
                isPast
                  ? "text-slate-300 cursor-not-allowed"
                  : isSel
                  ? "bg-pink-600 text-white font-semibold"
                  : isToday
                  ? "border border-pink-400 text-pink-700 font-semibold hover:bg-pink-50"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── StepDateTime ───────────────────────────────────────────────────────────────

interface Props {
  totalDuration: number;
  date: string;
  timeSlot: string;
  onBack: () => void;
  onNext: (date: string, slot: string) => void;
}

export function StepDateTime({ totalDuration, date, timeSlot, onBack, onNext }: Props) {
  const t = useTranslations("booking");
  // Read locale from the html[lang] attribute set by next-intl
  const locale =
    typeof document !== "undefined"
      ? (document.documentElement.lang || "en")
      : "en";

  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedSlot, setSelectedSlot] = useState(timeSlot);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = useCallback(
    async (d: string) => {
      setLoading(true);
      setSelectedSlot("");
      try {
        const s = await getAvailableSlots(d, totalDuration);
        setSlots(s);
      } finally {
        setLoading(false);
      }
    },
    [totalDuration]
  );

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  function handleSelectDate(d: string) {
    setSelectedDate(d);
  }

  function handleNext() {
    if (!selectedDate || !selectedSlot) return;
    onNext(selectedDate, selectedSlot);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Calendar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            {t("selectDate")}
          </p>
          <MiniCalendar
            selectedDate={selectedDate}
            onSelect={handleSelectDate}
            locale={locale}
          />
        </div>

        {/* Slots */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            {t("selectTime")}
          </p>

          {!selectedDate ? (
            <p className="text-sm text-slate-400 text-center py-6">
              {t("selectDate")} ←
            </p>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{t("loadingSlots")}</span>
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              {t("noSlotsForDate")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "rounded-lg border py-2 text-sm font-medium transition-all",
                    selectedSlot === slot
                      ? "border-pink-500 bg-pink-600 text-white"
                      : "border-slate-200 text-slate-700 hover:border-pink-300"
                  )}
                >
                  {formatSlot(slot, locale)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 sm:flex-none rounded-full px-6"
        >
          {t("back")}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedDate || !selectedSlot}
          className="flex-1 sm:flex-none bg-pink-600 hover:bg-pink-700 text-white rounded-full px-8"
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
