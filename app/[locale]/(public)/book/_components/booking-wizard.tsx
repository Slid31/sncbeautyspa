"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryWithServices, ServiceOption, ClientInfo, BookingDraft } from "../actions";
import { StepServices } from "./step-services";
import { StepClientInfo } from "./step-client-info";
import { StepDateTime } from "./step-date-time";
import { StepSummary } from "./step-summary";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  catalog: CategoryWithServices[];
  locale: string;
  preSelectServiceId?: string;
}

const EMPTY_CLIENT: ClientInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const EMPTY_DRAFT: BookingDraft = {
  services: [],
  client: EMPTY_CLIENT,
  date: "",
  timeSlot: "",
};

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepDots({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex items-center gap-0 w-full mb-8">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        return (
          <li key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              {/* Circle */}
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  done
                    ? "bg-pink-600 border-pink-600 text-white"
                    : active
                    ? "bg-white border-pink-600 text-pink-600"
                    : "bg-white border-slate-200 text-slate-400"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {/* Label — hidden on xs */}
              <span
                className={cn(
                  "hidden sm:block text-[10px] font-medium text-center leading-tight max-w-[64px]",
                  active ? "text-pink-700" : done ? "text-pink-500" : "text-slate-400"
                )}
              >
                {label}
              </span>
            </div>
            {/* Connector line */}
            {!last && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1 sm:mx-2 mt-[-12px] sm:mt-[-14px] transition-colors",
                  i < current ? "bg-pink-400" : "bg-slate-200"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── Wizard ─────────────────────────────────────────────────────────────────────

export function BookingWizard({ catalog, locale, preSelectServiceId }: Props) {
  const t = useTranslations("booking");

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);

  // Pre-select a service if coming from a service detail page
  useEffect(() => {
    if (!preSelectServiceId) return;
    for (const cat of catalog) {
      const found = cat.services.find((s) => s.id === preSelectServiceId);
      if (found) {
        setDraft((d) => ({
          ...d,
          services: d.services.some((s) => s.id === found.id)
            ? d.services
            : [found],
        }));
        break;
      }
    }
  }, [preSelectServiceId, catalog]);

  const stepLabels: string[] = [
    t("steps.services"),
    t("steps.clientInfo"),
    t("steps.dateTime"),
    t("steps.review"),
  ];

  const REVIEW_STEP = 3;

  function setServices(services: ServiceOption[]) {
    setDraft((d) => ({ ...d, services }));
  }

  function setClient(client: ClientInfo) {
    setDraft((d) => ({ ...d, client }));
  }

  function setDateTime(date: string, timeSlot: string) {
    setDraft((d) => ({ ...d, date, timeSlot }));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6">
        {t("title")}
      </h1>

      <StepDots steps={stepLabels} current={step} />

      {step === 0 && (
        <StepServices
          catalog={catalog}
          selected={draft.services}
          onChangeServices={setServices}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <StepClientInfo
          initial={draft.client}
          onBack={() => setStep(0)}
          onNext={(client) => {
            setClient(client);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <StepDateTime
          totalDuration={draft.services.reduce((s, svc) => s + svc.duration, 0)}
          date={draft.date}
          timeSlot={draft.timeSlot}
          onBack={() => setStep(1)}
          onNext={(date, slot) => {
            setDateTime(date, slot);
            setStep(3);
          }}
        />
      )}
      {step === REVIEW_STEP && (
        <StepSummary
          draft={draft}
          locale={locale}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
}
