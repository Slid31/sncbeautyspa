import { requireAdmin } from "@/lib/session";
import { useTranslations } from "next-intl";

function SettingsContent() {
  const t = useTranslations("admin.settings");
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
    </div>
  );
}

export default async function AdminSettingsPage() {
  await requireAdmin();
  return <SettingsContent />;
}
