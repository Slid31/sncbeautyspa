import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, Calendar, User, DollarSign, ArrowRight, XCircle } from "lucide-react";
import { getTranslations as getNavTranslations } from "next-intl/server";
import {
  confirmAppointmentBySession,
  getAppointmentByToken,
} from "../actions";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: { session_id?: string; token?: string };
};

function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { session_id, token } = searchParams;
  const base = locale === "fr" ? "/fr" : "";
  const [t, tb, tn] = await Promise.all([
    getTranslations("confirmation"),
    getTranslations("booking"),
    getNavTranslations("nav"),
  ]);

  // Confirm from Stripe session (first visit) or look up by token (revisit)
  let result;
  if (session_id) {
    result = await confirmAppointmentBySession(session_id, locale);
  } else if (token) {
    result = await getAppointmentByToken(token);
  } else {
    result = { ok: false as const, error: "not_found" as const };
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (!result.ok) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <XCircle className="h-8 w-8 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            {tb("sessionExpired")}
          </h1>
          <p className="text-slate-500 text-sm">
            {result.error === "not_paid"
              ? tb("paymentError")
              : tb("sessionExpired")}
          </p>
        </div>
        <Link
          href={`${base}/book`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
        >
          {t("bookAnother")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  const appt = result.appointment;
  const dateFormatted = formatDate(new Date(appt.date), locale);

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="h-16 w-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-slate-500">{t("subtitle")}</p>
        <p className="text-xs text-slate-400">
          {t("emailSentTo", { email: appt.client.email })}
        </p>
      </div>

      {/* Details card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {/* Services */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("services")}
            </p>
          </div>
          <div className="space-y-1.5">
            {appt.services.map((svc, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-700">{svc.name}</span>
                <span className="font-medium text-slate-800">${svc.price}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 border-t border-slate-100 mt-2">
              <span className="font-semibold text-slate-800">{tb("total")}</span>
              <span className="font-bold text-slate-900">
                ${appt.totalAmount}{" "}
                <span className="font-normal text-slate-500 text-xs">USD</span>
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Date */}
        <div className="p-5 flex items-start gap-3">
          <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              {t("dateTime")}
            </p>
            <p className="text-sm text-slate-800 capitalize">{dateFormatted}</p>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Client */}
        <div className="p-5 flex items-start gap-3">
          <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              {t("client")}
            </p>
            <p className="text-sm text-slate-800">
              {appt.client.firstName} {appt.client.lastName}
            </p>
            <p className="text-xs text-slate-500">{appt.client.email}</p>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Booking ref */}
        <div className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t("bookingRef")}
          </p>
          <p className="text-xs font-mono text-slate-500 break-all">{appt.id}</p>
        </div>
      </div>

      {/* Cancel info */}
      <p className="text-center text-xs text-slate-400">{t("cancelInfo")}</p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`${base}/book`}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
        >
          {t("bookAnother")}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={`${base}/`}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-medium hover:border-pink-300 hover:text-pink-700 transition-colors"
        >
          {tn("home")}
        </Link>
      </div>
    </div>
  );
}
