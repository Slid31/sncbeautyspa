import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("admin.dashboard");

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-gray-500">{t("overview")}</p>
    </div>
  );
}
