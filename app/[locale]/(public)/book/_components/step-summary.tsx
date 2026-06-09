"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, DollarSign, User, Calendar, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { BookingDraft } from "../actions";
import { createCheckoutSession } from "../actions";

interface Props {
  draft: BookingDraft;
  locale: string;
  onBack: () => void;
}

function formatDate(dateStr: string, slotStr: string, locale: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = slotStr.split(":").map(Number);
  const dt = new Date(y, m - 1, d, h, min);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(dt);
}

export function StepSummary({ draft, locale, onBack }: Props) {
  const t = useTranslations("booking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = draft.services.reduce((s, svc) => s + parseFloat(svc.price), 0);
  const totalDuration = draft.services.reduce((s, svc) => s + svc.duration, 0);

  async function handlePay() {
    setLoading(true);
    setError("");
    const result = await createCheckoutSession(draft, locale);
    if (result.ok) {
      window.location.href = result.url;
    } else {
      setError(t("paymentError"));
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">{t("reviewYourBooking")}</h2>

      {/* Summary card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {/* Services */}
        <div className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {t("services")}
          </p>
          <div className="space-y-2">
            {draft.services.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{svc.name}</p>
                  <p className="text-xs text-slate-500">{svc.duration} min</p>
                </div>
                <span className="text-sm font-semibold text-slate-700 shrink-0">
                  ${parseFloat(svc.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Date/time */}
        <div className="p-5 flex items-start gap-3">
          <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              {t("date")}
            </p>
            <p className="text-sm text-slate-800 capitalize">
              {formatDate(draft.date, draft.timeSlot, locale)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{totalDuration} min</p>
          </div>
        </div>

        <Separator />

        {/* Client info */}
        <div className="p-5 flex items-start gap-3">
          <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              {t("client")}
            </p>
            <p className="text-sm text-slate-800">
              {draft.client.firstName} {draft.client.lastName}
            </p>
            <p className="text-xs text-slate-500">{draft.client.email}</p>
            <p className="text-xs text-slate-500">{draft.client.phone}</p>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <p className="font-semibold text-slate-800">{t("total")}</p>
          </div>
          <p className="text-xl font-bold text-slate-900">
            ${total.toFixed(2)} <span className="text-sm font-medium text-slate-500">USD</span>
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 sm:flex-none rounded-full px-6"
        >
          {t("back")}
        </Button>
        <Button
          onClick={handlePay}
          disabled={loading}
          className="flex-1 sm:flex-none bg-pink-600 hover:bg-pink-700 text-white rounded-full px-8"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("processing")}
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              {t("proceedToPayment")}
            </>
          )}
        </Button>
      </div>

      {/* Stripe badge */}
      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3" />
        {t("stripePowered")}
      </p>
    </div>
  );
}
