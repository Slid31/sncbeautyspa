import { getTranslations } from "next-intl/server";
import { getDashboardData } from "@/lib/dashboard";
import { KpiCard } from "./_components/kpi-card";
import { AppointmentsTable } from "./_components/appointments-table";
import { RevenueChart } from "./_components/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, TrendingUp, Users, Scissors } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const [{ locale }, t, data] = await Promise.all([
    params,
    getTranslations("admin.dashboard"),
    getDashboardData(),
  ]);

  const {
    todayAppointments,
    monthRevenue,
    uniqueClients,
    mostBookedService,
    recentAppointments,
    revenueChart,
  } = data;

  return (
    <div className="px-8 py-8 space-y-8 max-w-[1400px]">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t("title")}
        </h1>
      </div>

      {/* ── KPI cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title={t("kpi.todayAppointments")}
          value={todayAppointments}
          icon={CalendarDays}
          accent="blue"
        />
        <KpiCard
          title={t("kpi.monthRevenue")}
          value={`$${monthRevenue.toFixed(2)}`}
          icon={TrendingUp}
          accent="green"
        />
        <KpiCard
          title={t("kpi.uniqueClients")}
          value={uniqueClients}
          icon={Users}
          accent="violet"
        />
        <KpiCard
          title={t("kpi.mostBooked")}
          value={mostBookedService ?? t("kpi.noData")}
          icon={Scissors}
          accent="rose"
          description={mostBookedService ? undefined : undefined}
        />
      </section>

      {/* ── Charts row ── */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue bar chart — spans 2 of 3 columns */}
        <Card className="xl:col-span-2 shadow-none border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              {t("revenueChart.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <RevenueChart
              data={revenueChart}
              currencyLabel={t("revenueChart.tooltip")}
            />
          </CardContent>
        </Card>

        {/* Quick stats summary — spans 1 column */}
        <Card className="shadow-none border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              {t("revenueChart.title").split("—")[0].trim()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {revenueChart.map((day) => (
              <div key={day.isoDate} className="flex items-center justify-between text-sm">
                <span className="text-slate-500 truncate">{day.day}</span>
                <span className="font-medium text-slate-800 ml-2 shrink-0">
                  ${day.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* ── Recent appointments table ── */}
      <section>
        <AppointmentsTable appointments={recentAppointments} locale={locale} />
      </section>
    </div>
  );
}
