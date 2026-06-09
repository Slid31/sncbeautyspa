import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TransactionsClient } from "./_components/transactions-client";

type Props = {
  params: Promise<{ locale: string }>;
};

// ── Revenue summary ────────────────────────────────────────────────────────────

function buildSummary(
  rows: {
    amount: { toFixed: (d: number) => string };
    status: string;
    createdAt: Date;
  }[]
) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  let totalRevenue = 0;
  let monthRevenue = 0;
  let transactionCount = 0;

  for (const row of rows) {
    if (row.status === "SUCCEEDED") {
      const amt = parseFloat(row.amount.toFixed(2));
      totalRevenue += amt;
      transactionCount++;
      if (row.createdAt >= monthStart) monthRevenue += amt;
    }
  }

  return {
    totalRevenue: totalRevenue.toFixed(2),
    monthRevenue: monthRevenue.toFixed(2),
    transactionCount,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminTransactionsPage({ params }: Props) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("admin.transactions")]);

  await requireAdmin();

  const rows = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      amount: true,
      currency: true,
      stripeChargeId: true,
      status: true,
      appointment: {
        select: {
          id: true,
          client: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  });

  const summary = buildSummary(rows);

  const transactions = rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    amount: r.amount.toFixed(2),
    currency: r.currency,
    stripeChargeId: r.stripeChargeId,
    status: r.status as "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED",
    appointment: {
      id: r.appointment.id,
      client: r.appointment.client,
    },
  }));

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {summary.transactionCount} {t("transactionCount").toLowerCase()}
        </p>
      </div>

      <TransactionsClient
        transactions={transactions}
        summary={summary}
        locale={locale}
      />
    </div>
  );
}
