import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  accent?: "blue" | "green" | "violet" | "rose";
}

const accentMap = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   ring: "ring-blue-100" },
  green:  { bg: "bg-emerald-50",icon: "text-emerald-600", ring: "ring-emerald-100" },
  violet: { bg: "bg-violet-50", icon: "text-violet-600",  ring: "ring-violet-100" },
  rose:   { bg: "bg-rose-50",   icon: "text-rose-600",    ring: "ring-rose-100" },
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  accent = "blue",
}: KpiCardProps) {
  const a = accentMap[accent];

  return (
    <Card className="shadow-none border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg ring-1", a.bg, a.ring)}>
          <Icon className={cn("h-4 w-4", a.icon)} />
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-1 truncate">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
