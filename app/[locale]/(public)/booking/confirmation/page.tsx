import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  DollarSign,
  Phone,
  AlertTriangle,
  Ban,
  CheckSquare,
  PartyPopper,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAppointmentByToken, confirmBySession } from "../actions";
import type { AppointmentDetail } from "../actions";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: { token?: string; session_id?: string };
};

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({
  status,
  t,
}: {
  status: AppointmentDetail["status"];
  t: Awaited<ReturnType<typeof getTranslations<"appointment">>>;
}) {
  const cfg = {
    CONFIRMED: {
      label: t("statusConfirmed"),
      icon: CheckCircle2,
      cls: "border-green-200 bg-green-50 text-green-700",
    },
    PENDING: {
      label: t("statusPending"),
      icon: Clock,
      cls: "border-amber-200 bg-amber-50 text-amber-700",
    },
    CANCELLED: {
      label: t("statusCancelled"),
      icon: Ban,
      cls: "border-red-200 bg-red-50 text-red-700",
    },
    COMPLETED: {
      label: t("statusCompleted"),
      icon: CheckSquare,
      cls: "border-slate-200 bg-slate-100 text-slate-600",
    },
  } as const;

  const { label, icon: Icon, cls } = cfg[status];

  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center gap-1.5 self-start text-sm px-3 py-1", cls)}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}

// ── Not-found view ─────────────────────────────────────────────────────────────

function NotFoundView({
  t,
  base,
}: {
  t: Awaited<ReturnType<typeof getTranslations<"appointment">>>;
  base: string;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="h-16 w-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto">
        <XCircle className="h-8 w-8 text-slate-400" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">{t("notFound")}</h1>
        <p className="text-sm text-slate-500">{t("notFoundSubtitle")}</p>
      </div>
      <Link
        href={`${base}/book`}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
      >
        {t("bookAnother")}
      </Link>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BookingConfirmationPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const token = searchParams.token ?? "";
  const sessionId = searchParams.session_id ?? "";
  const base = locale === "fr" ? "/fr" : "";

  const t = await getTranslations("appointment");

  if (!token) return <NotFoundView t={t} base={base} />;

  // ── Page-side confirm fallback ─────────────────────────────────────────────
  // Runs idempotently before fetching so the displayed status is always accurate
  // even when the Stripe webhook hasn't fired yet.
  if (sessionId) {
    await confirmBySession(sessionId, locale);
  }

  const result = await getAppointmentByToken(token);
  if (!result.ok) return <NotFoundView t={t} base={base} />;

  const { appointment: appt } = result;
  const dateFormatted = formatDate(new Date(appt.date), locale);
  const totalDuration = appt.services.reduce((s, svc) => s + svc.duration, 0);

  // True when user just arrived from Stripe Checkout
  const fromCheckout = Boolean(sessionId);
  const paymentConfirmed = fromCheckout && appt.paymentStatus === "PAID";

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t("title")}</h1>
        <StatusBadge status={appt.status} t={t} />
      </div>

      {/* ── Payment confirmed banner (Stripe redirect) ── */}
      {paymentConfirmed && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4">
          <PartyPopper className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-green-800">
            {t("paymentReceived")}
          </p>
        </div>
      )}

      {/* Payment still processing (edge case: page arrived before webhook + fallback) */}
      {fromCheckout && !paymentConfirmed && appt.status === "PENDING" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
          <Loader2 className="h-5 w-5 text-amber-600 mt-0.5 shrink-0 animate-spin" />
          <p className="text-sm text-amber-800">{t("paymentProcessing")}</p>
        </div>
      )}

      {/* Already-cancelled / completed notices */}
      {appt.status === "CANCELLED" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Ban className="h-4 w-4 mt-0.5 shrink-0" />
          {t("alreadyCancelled")}
        </div>
      )}

      {appt.status === "COMPLETED" && (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <CheckSquare className="h-4 w-4 mt-0.5 shrink-0" />
          {t("alreadyCompleted")}
        </div>
      )}

      {appt.tooLate && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          {t("tooLateToCancel")}
        </div>
      )}

      {/* Detail card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {/* Services */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("services")}
            </p>
          </div>
          <div className="space-y-2">
            {appt.services.map((svc, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">{svc.name}</p>
                  <p className="text-xs text-slate-500">{svc.duration} min</p>
                </div>
                <span className="text-sm font-semibold text-slate-700 shrink-0">
                  ${svc.price}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 border-t border-slate-100 mt-1">
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="h-3 w-3" />
                {totalDuration} min
              </span>
              <span className="font-bold text-slate-900">
                ${appt.totalAmount}{" "}
                <span className="font-normal text-slate-500 text-xs">USD</span>
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Date & time */}
        <div className="p-5 flex items-start gap-3">
          <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              {t("dateTime")}
            </p>
            <p className="text-sm text-slate-800 capitalize">{dateFormatted}</p>
          </div>
        </div>

        <Separator />

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
            {appt.client.phone && (
              <p className="text-xs text-slate-500">{appt.client.phone}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Booking ref */}
        <div className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t("bookingRef")}
          </p>
          <p className="text-xs font-mono text-slate-500 break-all">{appt.id}</p>
        </div>

        <Separator />

        {/* Salon contact */}
        <div className="p-5 flex items-start gap-3">
          <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              {t("salon")}
            </p>
            <p className="text-sm font-medium text-slate-800">{t("salonName")}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t("salonContact")}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {appt.canCancel && (
          <Link
            href={`${base}/booking/cancel?token=${token}`}
            className="flex items-center justify-center gap-2 w-full rounded-full border-2 border-red-300 bg-white px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            {t("cancelButton")}
          </Link>
        )}

        <Link
          href={`${base}/book`}
          className="flex items-center justify-center gap-2 w-full rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 hover:border-pink-300 hover:text-pink-700 transition-colors"
        >
          {t("bookAnother")}
        </Link>
      </div>
    </div>
  );
}
