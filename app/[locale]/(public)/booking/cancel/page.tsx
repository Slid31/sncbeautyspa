import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, AlertTriangle, Ban, CheckSquare, XCircle } from "lucide-react";
import { getAppointmentByToken } from "../actions";
import { CancelForm } from "./_components/cancel-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: { token?: string };
};

type Translations = Awaited<ReturnType<typeof getTranslations<"cancellation">>>;

// ── Blocking error views ───────────────────────────────────────────────────────

function ErrorView({
  t,
  base,
  message,
  icon,
  token,
}: {
  t: Translations;
  base: string;
  message: string;
  icon: "not_found" | "cancelled" | "completed" | "too_late";
  token?: string;
}) {
  const iconEl =
    icon === "cancelled" ? (
      <Ban className="h-8 w-8 text-red-400" />
    ) : icon === "completed" ? (
      <CheckSquare className="h-8 w-8 text-slate-400" />
    ) : icon === "too_late" ? (
      <AlertTriangle className="h-8 w-8 text-amber-400" />
    ) : (
      <XCircle className="h-8 w-8 text-slate-400" />
    );

  const circleCls =
    icon === "cancelled"
      ? "bg-red-50 border-red-100"
      : icon === "too_late"
      ? "bg-amber-50 border-amber-100"
      : "bg-slate-50 border-slate-200";

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div
        className={`h-16 w-16 rounded-full border flex items-center justify-center mx-auto ${circleCls}`}
      >
        {iconEl}
      </div>
      <p className="text-base text-slate-600 max-w-sm mx-auto">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {token && (
          <Link
            href={`${base}/booking/confirmation?token=${token}`}
            className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-slate-200 text-slate-700 text-sm font-medium hover:border-pink-300 hover:text-pink-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t("backToAppointment")}
          </Link>
        )}
        <Link
          href={`${base}/book`}
          className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
        >
          {t("bookAnother")}
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CancelPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const token = searchParams.token ?? "";
  const base = locale === "fr" ? "/fr" : "";

  const t = await getTranslations("cancellation");

  // ── No token ───────────────────────────────────────────────────────────────
  if (!token) {
    return <ErrorView t={t} base={base} message={t("notFound")} icon="not_found" />;
  }

  const result = await getAppointmentByToken(token);

  if (!result.ok) {
    return <ErrorView t={t} base={base} message={t("notFound")} icon="not_found" />;
  }

  const { appointment: appt } = result;

  // ── Already cancelled ──────────────────────────────────────────────────────
  if (appt.status === "CANCELLED") {
    return (
      <ErrorView
        t={t}
        base={base}
        message={t("alreadyCancelled")}
        icon="cancelled"
        token={token}
      />
    );
  }

  // ── Completed ──────────────────────────────────────────────────────────────
  if (appt.status === "COMPLETED") {
    return (
      <ErrorView
        t={t}
        base={base}
        message={t("completed")}
        icon="completed"
        token={token}
      />
    );
  }

  // ── Within 24h ─────────────────────────────────────────────────────────────
  if (appt.tooLate) {
    return (
      <ErrorView
        t={t}
        base={base}
        message={t("tooLate")}
        icon="too_late"
        token={token}
      />
    );
  }

  // ── Eligible: show confirm form ────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
      {/* Back link */}
      <Link
        href={`${base}/booking/confirmation?token=${token}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-pink-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToAppointment")}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
        {t("title")}
      </h1>

      <CancelForm
        appointment={appt}
        token={token}
        locale={locale}
        base={base}
      />
    </div>
  );
}
