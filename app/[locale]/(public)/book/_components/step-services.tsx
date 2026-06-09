"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, ChevronUp, Clock, DollarSign, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CategoryWithServices, ServiceOption } from "../actions";

interface Props {
  catalog: CategoryWithServices[];
  selected: ServiceOption[];
  onChangeServices: (services: ServiceOption[]) => void;
  onNext: () => void;
}

export function StepServices({ catalog, selected, onChangeServices, onNext }: Props) {
  const t = useTranslations("booking");
  const [openCats, setOpenCats] = useState<Set<string>>(
    () => new Set(catalog.length > 0 ? [catalog[0].id] : [])
  );
  const [error, setError] = useState(false);

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  function toggle(svc: ServiceOption) {
    const next = isSelected(svc.id)
      ? selected.filter((s) => s.id !== svc.id)
      : [...selected, svc];
    onChangeServices(next);
    setError(false);
  }

  function toggleCat(id: string) {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleNext() {
    if (selected.length === 0) { setError(true); return; }
    onNext();
  }

  const totalPrice = selected.reduce((s, svc) => s + parseFloat(svc.price), 0);
  const totalDuration = selected.reduce((s, svc) => s + svc.duration, 0);

  const allServices = catalog.flatMap((c) => c.services);

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm text-center mb-2">{t("selectServices")}</p>

      {allServices.length === 0 && (
        <p className="text-center text-slate-400 py-8">{t("noActiveServices")}</p>
      )}

      {catalog.map((cat) => {
        const isOpen = openCats.has(cat.id);
        return (
          <div
            key={cat.id}
            className={cn(
              "rounded-2xl border overflow-hidden",
              isOpen ? "border-pink-200" : "border-slate-200"
            )}
          >
            <button
              onClick={() => toggleCat(cat.id)}
              className="w-full flex items-center gap-3 p-4 text-left bg-white hover:bg-slate-50 transition-colors"
            >
              <span className="flex-1 font-semibold text-slate-800">{cat.name}</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
              )}
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 bg-slate-50/60 p-3 grid gap-2 sm:grid-cols-2">
                {cat.services.map((svc) => {
                  const sel = isSelected(svc.id);
                  return (
                    <button
                      key={svc.id}
                      onClick={() => toggle(svc)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-left transition-all bg-white",
                        sel
                          ? "border-pink-400 ring-1 ring-pink-300 shadow-sm"
                          : "border-slate-200 hover:border-pink-200"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                        {svc.image ? (
                          <img
                            src={svc.image}
                            alt={svc.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageOff className="h-4 w-4 text-slate-300" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium text-sm", sel ? "text-pink-700" : "text-slate-800")}>
                          {svc.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-0.5">
                            <DollarSign className="h-3 w-3" />
                            {parseFloat(svc.price).toFixed(2)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {svc.duration} min
                          </span>
                        </div>
                      </div>

                      {/* Checkmark */}
                      <div
                        className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                          sel ? "border-pink-600 bg-pink-600" : "border-slate-300"
                        )}
                      >
                        {sel && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {error && (
        <p className="text-sm text-red-500 text-center">{t("atLeastOneService")}</p>
      )}

      {/* Bottom bar */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-white/90 backdrop-blur-sm">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500">
              {t("selectedCount", { count: selected.length })}
            </p>
            {selected.length > 0 && (
              <div className="flex gap-3 text-sm font-medium text-slate-800 mt-0.5">
                <span>${totalPrice.toFixed(2)}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 text-xs self-center">
                  {t("estimatedDuration")}: {totalDuration} min
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={handleNext}
            disabled={selected.length === 0}
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-6"
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
