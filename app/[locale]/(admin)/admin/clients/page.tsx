import { useTranslations } from "next-intl";

export default function AdminClientsPage() {
  const t = useTranslations("admin.clients");
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
    </div>
  );
}
