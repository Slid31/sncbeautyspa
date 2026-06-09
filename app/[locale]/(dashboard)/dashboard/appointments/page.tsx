import { useTranslations } from "next-intl";

export default function MyAppointmentsPage() {
  const t = useTranslations("admin.appointments");

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
    </div>
  );
}
