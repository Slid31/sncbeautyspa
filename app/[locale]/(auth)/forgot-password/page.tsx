import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-gray-500">{t("subtitle")}</p>
    </div>
  );
}
