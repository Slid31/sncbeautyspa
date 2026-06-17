"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cancelAppointment } from "../../actions";
import type { AppointmentDetail } from "../../actions";

interface Props {
  appointment: AppointmentDetail;
  token: string;
  locale: string;
}

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

type State = "idle" | "loading" | "cancelled" | "error";

export function CancelForm({ appointment: appt, token, locale }: Props) {
  const t = useTranslations("cancellation");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const dateFormatted = formatDate(new Date(appt.date), locale);

  async function handleConfirm() {
    setState("loading");
    const result = await cancelAppointment(token, locale);

    if (result.ok) {
      setState("cancelled");
    } else {
      const messages: Record<string, string> = {
        too_late: t("tooLate"),
        already_cancelled: t("alreadyCancelled"),
        completed: t("completed"),
        not_found: t("notFound"),
        failed: t("error"),
      };
      setErrorMsg(messages[result.error] ?? t("error"));
      setState("error");
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (state === "cancelled") {
    return (
      <div className="text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">{t("successTitle")}</h2>
          <p className="text-slate-500 text-sm">{t("successSubtitle")}</p>
          <p className="text-xs text-slate-400 mt-2">{t("successEmail")}</p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href={"/book"}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
          >
            {t("bookAnother")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Main cancel form ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">{t("subtitle")}</p>
          <p className="text-xs text-amber-700 mt-0.5">{t("warning")}</p>
        </div>
      </div>

      {/* Appointment summary */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 bg-slate-50/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t("appointmentDetails")}
          </p>
        </div>
        <Separator />
        <div className="p-5 space-y-4">
          {/* Date */}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{locale === "fr" ? "Date" : "Date"}</p>
            <p className="text-sm font-medium text-slate-800 capitalize">{dateFormatted}</p>
          </div>
          {/* Services */}
          <div>
            <p className="text-xs text-slate-400 mb-1">
              {locale === "fr" ? "Services" : "Services"}
            </p>
            <ul className="space-y-1">
              {appt.services.map((svc, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-slate-700">{svc.name}</span>
                  <span className="text-slate-500">${svc.price}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Total */}
          <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-700">
              {locale === "fr" ? "Total payé" : "Total paid"}
            </span>
            <span className="font-bold text-slate-900">
              ${appt.totalAmount}{" "}
              <span className="text-xs font-normal text-slate-500">USD</span>
            </span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {state === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleConfirm}
          disabled={state === "loading"}
          variant="destructive"
          className="w-full rounded-full"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("cancelling")}
            </>
          ) : (
            t("confirmButton")
          )}
        </Button>

        <Link
          href={`/booking/confirmation?token=${token}`}
          className="flex items-center justify-center w-full rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:border-pink-300 hover:text-pink-700 transition-colors"
        >
          {t("keepButton")}
        </Link>
      </div>
    </div>
  );
}
