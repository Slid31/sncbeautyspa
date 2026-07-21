"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Mail, Phone, CheckCircle2, Send, MessageSquare, MapPin } from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.524 5.855L0 24l6.336-1.5A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.49-5.18-1.348l-.371-.214-3.862.913.975-3.763-.235-.386A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}
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
        </div>

        <div className="grid gap-10 lg:grid-cols-5 items-start mb-10">
          {/* ── Left: info cards ── */}
          <div className="lg:col-span-2 space-y-4">
            <InfoCard icon={MessageSquare} label="SMS" value="+1 347-313-6461" href="sms:+13473136461" />
            <InfoCard icon={WhatsAppIcon} label="WhatsApp" value="+1 347-313-6461" href="https://wa.me/13473136461" />
            <InfoCard icon={Mail}  label={t("email")} value="sncbeauty1@gmail.com" href="mailto:sncbeauty1@gmail.com" />
            <InfoCard icon={MapPin} label={t("address")} value="2795 3rd Ave, Bronx, NY 10455" href="https://maps.google.com/?q=2795+3rd+Ave,+Bronx,+NY+10455" />
            {/* <InfoCard icon={MapPin} label={t("address")} value={t("addressValue")} /> */}

            {/* Hours */}
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-3">
                {t("hours")}
              </p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <HourRow day={t("tueSat")}  hours="9:00 AM – 7:00 PM" />
                <HourRow day={t("sunday")} hours="10:00 AM – 5:00 PM" />
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
                <p className="text-sm text-slate-500 italic text-center">{t("subtitle")}</p>
              </form>
            )}
          </div>
        </div>
        {/* ── Map ── */}
        {/* <div className="rounded-2xl overflow-hidden border border-pink-100 shadow-sm">
          <iframe
            title={t("mapTitle")}
            src="https://www.openstreetmap.org/export/embed.html?bbox=-73.6273%2C45.4773%2C-73.5273%2C45.5373&layer=mapnik&marker=45.5073%2C-73.5773"
            width="100%"
            height="360"
            loading="lazy"
            style={{ display: "block", border: 0 }}
            allowFullScreen
          />
        </div> */}

      </div>
    </section>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function InfoCard({
  icon: Icon,
  label,
  value,
  href,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
  subtitle?: string;
}) {
  const inner = (
    <div className="flex items-start gap-4 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
      <div className="mt-0.5 h-9 w-9 shrink-0 rounded-xl bg-pink-50 flex items-center justify-center">
        <Icon className="h-4 w-4 text-pink-600" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }
  return inner;
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
