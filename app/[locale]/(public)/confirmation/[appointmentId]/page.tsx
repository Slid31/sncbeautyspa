import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; appointmentId: string }>;
};

export default async function ConfirmationPage({ params }: Props) {
  const { appointmentId } = await params;
  const t = await getTranslations("confirmation");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("subtitle")}</p>
      <p>
        {t("bookingRef")}: {appointmentId}
      </p>
    </div>
  );
}
