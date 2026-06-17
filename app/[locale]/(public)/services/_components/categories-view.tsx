"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  ImageOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  image: string | null;
};

export type CategoryItem = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  services: ServiceItem[];
};

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  categories: CategoryItem[];
}

export function CategoriesView({ categories }: Props) {
  const t = useTranslations("services");

  // All categories start collapsed; auto-open single category
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(categories.length === 1 ? [categories[0].id] : [])
  );

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const isOpen = openIds.has(cat.id);

        return (
          <div
            key={cat.id}
            className={cn(
              "rounded-2xl border bg-white overflow-hidden transition-shadow",
              isOpen ? "border-pink-200 shadow-md" : "border-slate-200 shadow-sm"
            )}
          >
            {/* ── Category header (click to toggle) ── */}
            <button
              onClick={() => toggle(cat.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
              aria-expanded={isOpen}
            >
              {/* Category image */}
              <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageOff className="h-5 w-5 text-slate-300" />
                )}
              </div>

              {/* Name + count */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-base">
                  {cat.name}
                </p>
                {cat.description && (
                  <p className="text-sm text-slate-500 truncate mt-0.5">
                    {cat.description}
                  </p>
                )}
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] shrink-0 mr-2",
                  isOpen
                    ? "border-pink-200 bg-pink-50 text-pink-700"
                    : "border-slate-200 text-slate-500"
                )}
              >
                {t("servicesCount", { count: cat.services.length })}
              </Badge>

              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
              )}
            </button>

            {/* ── Services grid (expanded) ── */}
            {isOpen && (
              <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                {cat.services.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    {t("noServicesInCategory")}
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.services.map((svc) => (
                      <Link
                        key={svc.id}
                        href={`/services/${svc.id}`}
                        className="group flex flex-col rounded-xl border border-slate-200 bg-white hover:border-pink-200 hover:shadow-sm transition-all overflow-hidden"
                      >
                        {/* Service image */}
                        <div className="h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
                          {svc.image ? (
                            <img
                              src={svc.image}
                              alt={svc.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <ImageOff className="h-8 w-8 text-slate-300" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-4 space-y-2">
                          <h3 className="font-medium text-slate-900 text-sm leading-snug group-hover:text-pink-700 transition-colors">
                            {svc.name}
                          </h3>
                          {svc.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {svc.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-slate-400" />
                              <span className="font-medium text-slate-700">
                                {parseFloat(svc.price).toFixed(2)}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {t("durationUnit", { count: svc.duration })}
                            </span>
                          </div>
                        </div>

                        {/* Book CTA */}
                        <div className="px-4 pb-4">
                          <span className="block text-center py-1.5 rounded-lg bg-pink-50 text-pink-700 text-xs font-semibold group-hover:bg-pink-600 group-hover:text-white transition-colors">
                            {t("bookNow")}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
