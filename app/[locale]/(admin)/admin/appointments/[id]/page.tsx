import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AppointmentDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("admin.appointments");

  const appt = await prisma.appointment.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      cancelToken: true,
      intakeFormToken: true,
      intakeFormTokenExpiresAt: true,
      intakeFormCompletedAt: true,
      client: { select: { firstName: true, lastName: true, email: true, phone: true } },
      services: {
        select: {
          priceSnapshot: true,
          service: {
            select: {
              name: true,
              category: {
                select: {
                  name: true,
                  intakeForm: { select: { id: true, fields: true } },
                },
              },
            },
          },
        },
      },
      intakeFormResponse: {
        select: { responses: true, formId: true },
      },
    },
  });

  if (!appt) notFound();

  // Determine intake form status
  const hasIntakeForms = appt.services.some(
    (s) => s.service.category.intakeForm !== null
  );

  let intakeStatus: "completed" | "pending" | "na" = "na";
  if (hasIntakeForms) {
    intakeStatus = appt.intakeFormCompletedAt ? "completed" : "pending";
  }

  // Parse responses grouped by category/service
  const responses = appt.intakeFormResponse?.responses as Record<string, unknown> | null;

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-3xl">
      {/* Back */}
      <Link
        href="../appointments"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("title")}
      </Link>

      <h1 className="text-2xl font-bold text-slate-900">{t("detailTitle")}</h1>

      {/* Main info card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <Row label={t("client")}>
          {appt.client.firstName} {appt.client.lastName}
          <span className="block text-sm text-slate-500">{appt.client.email}</span>
          {appt.client.phone && <span className="block text-sm text-slate-500">{appt.client.phone}</span>}
        </Row>
        <hr className="border-slate-100" />
        <Row label={t("date")}>
          {new Intl.DateTimeFormat("en-CA", {
            dateStyle: "full",
            timeStyle: "short",
          }).format(appt.date)}
        </Row>
        <hr className="border-slate-100" />
        <Row label={t("services")}>
          <ul className="space-y-0.5">
            {appt.services.map((s, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{s.service.name}</span>
                <span className="text-slate-500">${s.priceSnapshot.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Row>
        <hr className="border-slate-100" />
        <Row label={t("total")}>${Number(appt.totalAmount).toFixed(2)}</Row>
        <hr className="border-slate-100" />
        <Row label={t("status")}>
          <StatusBadge value={appt.status} />
        </Row>
        <hr className="border-slate-100" />
        <Row label={t("paymentStatus")}>
          <span
            className={
              appt.paymentStatus === "PAID"
                ? "text-green-700 font-medium"
                : "text-amber-600 font-medium"
            }
          >
            {appt.paymentStatus}
          </span>
        </Row>
      </div>

      {/* Intake form section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{t("intakeForm")}</h2>
          {intakeStatus === "completed" && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              ✅ {t("intakeCompleted")}
            </span>
          )}
          {intakeStatus === "pending" && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              ⚠️ {t("intakePending")}
            </span>
          )}
          {intakeStatus === "na" && (
            <span className="text-sm text-slate-400">— {t("intakeNA")}</span>
          )}
        </div>

        {intakeStatus === "completed" && responses && (
          <ResponsesView responses={responses} />
        )}

        {intakeStatus === "pending" && appt.intakeFormToken && (
          <p className="text-sm text-slate-500">
            {t("intakeLink")}:{" "}
            <span className="font-mono text-xs break-all text-slate-400">
              /intake/{appt.intakeFormToken}
            </span>
            {appt.intakeFormTokenExpiresAt && (
              <span className="block mt-1">
                {t("intakeExpires")}:{" "}
                {new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" }).format(
                  appt.intakeFormTokenExpiresAt
                )}
              </span>
            )}
          </p>
        )}

        {intakeStatus === "na" && (
          <p className="text-sm text-slate-400">{t("noIntakeForm")}</p>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <span className="text-sm text-slate-500 w-36 shrink-0">{label}</span>
      <span className="text-sm text-slate-900 font-medium">{children}</span>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[value] ?? "bg-slate-100 text-slate-700"}`}>
      {value}
    </span>
  );
}

function ResponsesView({ responses }: { responses: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      {Object.entries(responses).map(([key, val]) => (
        <div key={key} className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-slate-100 last:border-0">
          <span className="text-sm text-slate-500 w-48 shrink-0">{key}</span>
          <span className="text-sm text-slate-900">
            {typeof val === "boolean" ? (val ? "✓ Yes" : "✗ No") : String(val ?? "—")}
          </span>
        </div>
      ))}
    </div>
  );
}
