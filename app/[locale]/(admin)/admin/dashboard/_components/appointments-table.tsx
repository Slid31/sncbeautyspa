import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentAppointment } from "@/lib/dashboard";
import { getTranslations } from "next-intl/server";

// ── status → badge variant + label ───────────────────────────────────────────

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_STYLE: Record<string, { variant: BadgeVariant; className: string }> = {
  PENDING:   { variant: "outline",     className: "border-amber-300 text-amber-700 bg-amber-50" },
  CONFIRMED: { variant: "outline",     className: "border-blue-300  text-blue-700  bg-blue-50"  },
  COMPLETED: { variant: "outline",     className: "border-emerald-300 text-emerald-700 bg-emerald-50" },
  CANCELLED: { variant: "destructive", className: "" },
};

const PAYMENT_STYLE: Record<string, { variant: BadgeVariant; className: string }> = {
  PAID:   { variant: "outline", className: "border-emerald-300 text-emerald-700 bg-emerald-50" },
  UNPAID: { variant: "outline", className: "border-slate-300 text-slate-500" },
};

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  appointments: RecentAppointment[];
  locale: string;
}

export async function AppointmentsTable({ appointments, locale }: Props) {
  const t = await getTranslations("admin.dashboard");
  const dt = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="shadow-none border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-800">
          {t("recentAppointments.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        {appointments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10 px-6">
            {t("recentAppointments.empty")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-xs text-slate-500 pl-6">
                  {t("recentAppointments.client")}
                </TableHead>
                <TableHead className="text-xs text-slate-500">
                  {t("recentAppointments.services")}
                </TableHead>
                <TableHead className="text-xs text-slate-500">
                  {t("recentAppointments.date")}
                </TableHead>
                <TableHead className="text-xs text-slate-500">
                  {t("recentAppointments.status")}
                </TableHead>
                <TableHead className="text-xs text-slate-500 pr-6 text-right">
                  {t("recentAppointments.payment")}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {appointments.map((apt) => {
                const statusStyle = STATUS_STYLE[apt.status] ?? STATUS_STYLE.PENDING;
                const payStyle    = PAYMENT_STYLE[apt.paymentStatus] ?? PAYMENT_STYLE.UNPAID;

                return (
                  <TableRow key={apt.id} className="border-slate-100 hover:bg-slate-50">
                    {/* Client */}
                    <TableCell className="pl-6 font-medium text-slate-800 text-sm">
                      {apt.client.firstName} {apt.client.lastName}
                    </TableCell>

                    {/* Services */}
                    <TableCell className="text-sm text-slate-600 max-w-[180px]">
                      <span className="line-clamp-1">
                        {apt.serviceNames.join(", ") || "—"}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                      {dt.format(new Date(apt.date))}
                    </TableCell>

                    {/* Appointment status */}
                    <TableCell>
                      <Badge
                        variant={statusStyle.variant}
                        className={`text-[11px] font-medium ${statusStyle.className}`}
                      >
                        {t(`appointmentStatus.${apt.status}`)}
                      </Badge>
                    </TableCell>

                    {/* Payment status */}
                    <TableCell className="pr-6 text-right">
                      <Badge
                        variant={payStyle.variant}
                        className={`text-[11px] font-medium ${payStyle.className}`}
                      >
                        {t(`paymentStatus.${apt.paymentStatus}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
