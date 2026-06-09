"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, SortHeader } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, DollarSign, TrendingUp, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

export type TransactionRow = {
  id: string;
  createdAt: string; // ISO
  amount: string; // toFixed(2)
  currency: string;
  stripeChargeId: string | null;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  appointment: {
    id: string;
    client: { firstName: string; lastName: string; email: string };
  };
};

export type RevenueSummary = {
  totalRevenue: string;
  monthRevenue: string;
  transactionCount: number;
};

// ── Transaction status badge ───────────────────────────────────────────────────

type TxStatus = TransactionRow["status"];

const TX_STATUS_STYLE: Record<TxStatus, string> = {
  SUCCEEDED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING:   "border-amber-200 bg-amber-50 text-amber-700",
  FAILED:    "border-red-200 bg-red-50 text-red-600",
  REFUNDED:  "border-purple-200 bg-purple-50 text-purple-700",
};

function TxStatusBadge({ status, label }: { status: TxStatus; label: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-medium", TX_STATUS_STYLE[status])}
    >
      {label}
    </Badge>
  );
}

// ── Column factory ─────────────────────────────────────────────────────────────

function createColumns(
  t: ReturnType<typeof useTranslations<"admin.transactions">>,
  locale: string
): ColumnDef<TransactionRow>[] {
  const fmt = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  function statusLabel(s: TxStatus): string {
    const map: Record<TxStatus, string> = {
      SUCCEEDED: t("statusSucceeded"),
      PENDING:   t("pending"),
      FAILED:    t("statusFailed"),
      REFUNDED:  t("statusRefunded"),
    };
    return map[s] ?? s;
  }

  return [
    {
      id: "createdAt",
      accessorFn: (r) => r.createdAt,
      sortingFn: "alphanumeric",
      header: ({ column }) => <SortHeader column={column} label={t("date")} />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-slate-600">
          {fmt.format(new Date(row.original.createdAt))}
        </span>
      ),
    },
    {
      id: "client",
      accessorFn: (r) =>
        `${r.appointment.client.firstName} ${r.appointment.client.lastName}`,
      header: ({ column }) => <SortHeader column={column} label={t("client")} />,
      cell: ({ row }) => {
        const { client } = row.original.appointment;
        return (
          <div>
            <p className="font-medium text-slate-800">
              {client.firstName} {client.lastName}
            </p>
            <p className="text-xs text-slate-400">{client.email}</p>
          </div>
        );
      },
    },
    {
      id: "amount",
      accessorFn: (r) => parseFloat(r.amount),
      header: ({ column }) => (
        <SortHeader column={column} label={t("amount")} className="justify-end" />
      ),
      cell: ({ row }) => (
        <span className="block text-right font-semibold text-slate-800">
          ${row.original.amount}{" "}
          <span className="text-xs font-normal text-slate-400">
            {row.original.currency}
          </span>
        </span>
      ),
    },
    {
      id: "stripeCharge",
      accessorFn: (r) => r.stripeChargeId ?? "",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("stripeCharge")}
        </span>
      ),
      cell: ({ row }) =>
        row.original.stripeChargeId ? (
          <span className="font-mono text-xs text-slate-500 max-w-[160px] truncate block">
            {row.original.stripeChargeId}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: "status",
      accessorFn: (r) => r.status,
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("status")}
        </span>
      ),
      cell: ({ row }) => (
        <TxStatusBadge
          status={row.original.status}
          label={statusLabel(row.original.status)}
        />
      ),
    },
  ];
}

// ── CSV export ─────────────────────────────────────────────────────────────────

function exportCSV(transactions: TransactionRow[], filename: string, locale: string) {
  const fmt = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const headers = ["Date", "Client", "Email", "Amount", "Currency", "Stripe Charge ID", "Status"];

  const rows = transactions.map((t) => [
    fmt.format(new Date(t.createdAt)),
    `${t.appointment.client.firstName} ${t.appointment.client.lastName}`,
    t.appointment.client.email,
    t.amount,
    t.currency,
    t.stripeChargeId ?? "",
    t.status,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="h-9 w-9 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-pink-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  transactions: TransactionRow[];
  summary: RevenueSummary;
  locale: string;
}

export function TransactionsClient({ transactions, summary, locale }: Props) {
  const t = useTranslations("admin.transactions");

  const columns = React.useMemo(
    () => createColumns(t, locale),
    [t, locale]
  );

  return (
    <>
      {/* ── Revenue summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label={t("totalRevenue")}
          value={`$${summary.totalRevenue} USD`}
          icon={DollarSign}
        />
        <KpiCard
          label={t("monthRevenue")}
          value={`$${summary.monthRevenue} USD`}
          icon={TrendingUp}
        />
        <KpiCard
          label={t("transactionCount")}
          value={String(summary.transactionCount)}
          icon={Hash}
        />
      </div>

      {/* ── Header with export button ── */}
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() =>
            exportCSV(transactions, "transactions", locale)
          }
        >
          <Download className="h-4 w-4" />
          {t("export")}
        </Button>
      </div>

      {/* ── DataTable ── */}
      <DataTable
        columns={columns}
        data={transactions}
        pageSize={20}
        emptyMessage={t("empty")}
        previousLabel={t("previous")}
        nextLabel={t("next")}
      />
    </>
  );
}
