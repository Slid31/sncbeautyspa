import { getTranslations } from "next-intl/server";
import { getAppointments } from "./actions";
import { AppointmentsClient } from "./_components/appointments-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAppointmentsPage({ params }: Props) {
  const { locale } = await params;
  const [appointments, t] = await Promise.all([
    getAppointments(),
    getTranslations("admin.appointments"),
  ]);

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {appointments.length} {t("all").toLowerCase()}
        </p>
      </div>

      <AppointmentsClient
        appointments={appointments}
        locale={locale}
      />
    </div>
  );
}
