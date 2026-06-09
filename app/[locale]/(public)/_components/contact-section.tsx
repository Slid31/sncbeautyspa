"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "../_actions/contact";

const schema = z.object({
  name:    z.string().min(1),
  email:   z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
});
type FormValues = z.infer<typeof schema>;

export function ContactSection() {
  const t = useTranslations("home.contact");
  const [sent, setSent] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(values: FormValues) {
    const result = await submitContact(values);
    if (result.ok) {
      setSent(true);
    } else {
      form.setError("root", { message: t("errorGeneric") });
    }
  }

  return (
    <section className="bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold uppercase tracking-wider">
            <Mail className="h-3.5 w-3.5" />
            {t("eyebrow")}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            {t("title")}
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">{t("subtitle")}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-5 items-start mb-10">
          {/* ── Left: info cards ── */}
          <div className="lg:col-span-2 space-y-4">
            <InfoCard icon={Phone} label={t("phone")} value="+1 (514) 000-0000" />
            <InfoCard icon={Mail}  label={t("email")} value="contact@sncbeautysalon.com" />
            <InfoCard icon={MapPin} label={t("address")} value={t("addressValue")} />

            {/* Hours */}
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-3">
                {t("hours")}
              </p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <HourRow day={t("monFri")}  hours="9:00 – 18:00" />
                <HourRow day={t("saturday")} hours="10:00 – 16:00" />
                <HourRow day={t("sunday")}  hours={t("closed")} closed />
              </ul>
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="lg:col-span-3 rounded-2xl border border-pink-100 bg-white p-8 shadow-sm">
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
                <CheckCircle2 className="h-14 w-14 text-green-500" />
                <h3 className="text-xl font-bold text-slate-900">{t("successTitle")}</h3>
                <p className="text-slate-500 max-w-sm">{t("successBody")}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => { setSent(false); form.reset(); }}
                >
                  {t("sendAnother")}
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={t("fieldName")}
                    error={form.formState.errors.name?.message}
                  >
                    <Input
                      placeholder={t("placeholderName")}
                      {...form.register("name")}
                    />
                  </Field>
                  <Field
                    label={t("fieldEmail")}
                    error={form.formState.errors.email?.message}
                  >
                    <Input
                      type="email"
                      placeholder={t("placeholderEmail")}
                      {...form.register("email")}
                    />
                  </Field>
                </div>

                <Field
                  label={t("fieldSubject")}
                  error={form.formState.errors.subject?.message}
                >
                  <Input
                    placeholder={t("placeholderSubject")}
                    {...form.register("subject")}
                  />
                </Field>

                <Field
                  label={t("fieldMessage")}
                  error={form.formState.errors.message?.message}
                >
                  <Textarea
                    placeholder={t("placeholderMessage")}
                    rows={5}
                    className="resize-none"
                    {...form.register("message")}
                  />
                </Field>

                {form.formState.errors.root && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full py-3 font-semibold gap-2"
                >
                  <Send className="h-4 w-4" />
                  {form.formState.isSubmitting ? t("sending") : t("send")}
                </Button>
              </form>
            )}
          </div>
        </div>
        {/* ── Map ── */}
        <div className="rounded-2xl overflow-hidden border border-pink-100 shadow-sm">
          <iframe
            title={t("mapTitle")}
            src="https://www.openstreetmap.org/export/embed.html?bbox=-73.6273%2C45.4773%2C-73.5273%2C45.5373&layer=mapnik&marker=45.5073%2C-73.5773"
            width="100%"
            height="360"
            loading="lazy"
            style={{ display: "block", border: 0 }}
            allowFullScreen
          />
        </div>

      </div>
    </section>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
      <div className="mt-0.5 h-9 w-9 shrink-0 rounded-xl bg-pink-50 flex items-center justify-center">
        <Icon className="h-4 w-4 text-pink-600" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function HourRow({
  day,
  hours,
  closed,
}: {
  day: string;
  hours: string;
  closed?: boolean;
}) {
  return (
    <li className="flex justify-between">
      <span className="text-slate-700">{day}</span>
      <span className={closed ? "text-slate-400 italic" : "font-medium text-slate-800"}>
        {hours}
      </span>
    </li>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
