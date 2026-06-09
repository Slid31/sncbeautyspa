"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RevenueDay } from "@/lib/dashboard";

interface TooltipPayload {
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
  currencyLabel,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  currencyLabel: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-slate-700 mb-0.5">{label}</p>
      <p className="text-slate-900 font-semibold">
        ${payload[0].value.toFixed(2)}{" "}
        <span className="font-normal text-slate-500 text-xs">{currencyLabel}</span>
      </p>
    </div>
  );
}

interface Props {
  data: RevenueDay[];
  currencyLabel: string;
}

export function RevenueChart({ data, currencyLabel }: Props) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />

        <YAxis
          width={48}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v}`}
          domain={[0, Math.ceil(maxRevenue * 1.15)]}
        />

        <Tooltip
          content={<CustomTooltip currencyLabel={currencyLabel} />}
          cursor={{ fill: "#f8fafc" }}
        />

        <Bar
          dataKey="revenue"
          fill="#db2777"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
