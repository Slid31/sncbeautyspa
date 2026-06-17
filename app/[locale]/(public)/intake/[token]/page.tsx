import { getTranslations } from "next-intl/server";
import { Scissors } from "lucide-react";
import { validateIntakeToken } from "./actions";
import { IntakeFormClient } from "./_components/intake-form-client";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export default async function IntakePage({ params }: Props) {
  const { locale, token } = await params;
  const t = await getTranslations("intake");

  const result = await validateIntakeToken(token);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-2">
          <Scissors className="h-5 w-5 text-pink-500" />
          <span className="font-semibold text-slate-900">SNC Beauty Salon</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        {result.status === "not_found" && (
          <StatusCard emoji="❌" title={t("notFound")} body={t("notFoundBody")} />
        )}

        {result.status === "expired" && (
          <StatusCard emoji="⏰" title={t("expired")} body={t("expiredBody")} />
        )}

        {result.status === "completed" && (
          <StatusCard emoji="✅" title={t("alreadyCompleted")} body={t("alreadyCompletedBody")} />
        )}

        {result.status === "valid" && result.data.forms.length === 0 && (
          <StatusCard emoji="ℹ️" title={t("noForms")} body={t("noFormsBody")} />
        )}

        {result.status === "valid" && result.data.forms.length > 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
              <p className="text-slate-500 mt-1">
                {t("greeting", { name: result.data.clientFirstName })}
              </p>
            </div>

            <IntakeFormClient
              token={token}
              data={result.data}
              copy={{
                submitButton: t("submit"),
                submitting: t("submitting"),
                successTitle: t("successTitle"),
                successBody: t("successBody"),
                requiredField: t("requiredField"),
                sectionPrefix: t("sectionPrefix"),
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function StatusCard({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
      <div className="text-4xl">{emoji}</div>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-slate-500">{body}</p>
    </div>
  );
}
