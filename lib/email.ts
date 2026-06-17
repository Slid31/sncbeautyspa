import * as React from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ConfirmationEmail } from "@/emails/confirmation-email";
import { CancellationEmail } from "@/emails/cancellation-email";
import { IntakeReminderEmail } from "@/emails/intake-reminder-email";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatShortDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function deliver(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — skipping email to ${to}`);
    return;
  }

  const from =
    process.env.RESEND_FROM ?? "SNC Beauty Salon & Spa <no-reply@resend.dev>";

  const { error } = await resend.emails.send({ from, to, subject, html });

  if (error) {
    console.error(`[email] Resend error sending to ${to}:`, error);
  } else {
    console.log(`[email] Sent "${subject}" to ${to}`);
  }
}

// ── Confirmation email ─────────────────────────────────────────────────────────

export type ConfirmationEmailData = {
  clientFirstName: string;
  clientEmail: string;
  appointmentDate: Date;
  services: { name: string; duration: number; price: string }[];
  totalAmount: string;
  cancelToken: string;
  intakeFormToken?: string;
  locale: string;
  // Receipt
  transactionId: string;
  paymentDate: Date;
  cardLast4?: string;
};

export async function sendConfirmationEmail(
  data: ConfirmationEmailData
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const locale = (data.locale === "fr" ? "fr" : "en") as "en" | "fr";
  const localePrefix = locale === "fr" ? "/fr" : "";
  const manageUrl = `${appUrl}${localePrefix}/booking/confirmation?token=${data.cancelToken}`;

  const subject =
    locale === "fr"
      ? "Rendez-vous confirmé & reçu de paiement – SNC Beauty Salon & Spa"
      : "Appointment confirmed & payment receipt – SNC Beauty Salon & Spa";

  const intakeFormUrl = data.intakeFormToken
    ? `${appUrl}${localePrefix}/intake/${data.intakeFormToken}`
    : undefined;

  // Salon contact info from env
  const salonPhone = process.env.SALON_PHONE;
  const salonEmail =
    process.env.SALON_EMAIL ??
    (process.env.RESEND_FROM?.match(/<(.+)>/)?.[1]) ??
    "contact@sncbeautysalon.com";
  const salonAddress =
    process.env.SALON_ADDRESS ?? "Montreal, QC";

  // Format transaction reference as "#TXN-XXXXXXXX"
  const transactionRef = `#TXN-${data.transactionId.slice(0, 8).toUpperCase()}`;

  const html = await render(
    React.createElement(ConfirmationEmail, {
      clientFirstName: data.clientFirstName,
      appointmentDate: formatDate(data.appointmentDate, locale),
      paymentDate: formatShortDate(data.paymentDate, locale),
      services: data.services,
      totalAmount: data.totalAmount,
      manageUrl,
      intakeFormUrl,
      transactionRef,
      cardLast4: data.cardLast4,
      salonPhone,
      salonEmail,
      salonAddress,
      locale,
    })
  );

  await deliver(data.clientEmail, subject, html);
}

// ── Contact email ──────────────────────────────────────────────────────────────

export type ContactEmailData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  const to =
    process.env.CONTACT_EMAIL ??
    process.env.RESEND_FROM?.replace(/^.*<(.+)>$/, "$1") ??
    "contact@sncbeautysalon.com";

  const subject = `[Contact] ${data.subject}`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
      <h2 style="color:#db2777;margin-bottom:24px">New contact message</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#64748b;width:100px"><b>Name</b></td><td style="padding:8px 0;color:#0f172a">${data.name}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b"><b>Email</b></td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#db2777">${data.email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#64748b"><b>Subject</b></td><td style="padding:8px 0;color:#0f172a">${data.subject}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
      <p style="color:#0f172a;white-space:pre-wrap;line-height:1.6">${data.message.replace(/</g, "&lt;")}</p>
    </div>
  `;

  await deliver(to, subject, html);
}

// ── Intake reminder email ──────────────────────────────────────────────────────

export type IntakeReminderEmailData = {
  clientFirstName: string;
  clientEmail: string;
  appointmentDate: Date;
  services: { name: string; duration: number }[];
  intakeFormToken: string;
  intakeFormTokenExpiresAt: Date;
  locale: string;
};

export async function sendIntakeReminderEmail(
  data: IntakeReminderEmailData
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const locale = (data.locale === "fr" ? "fr" : "en") as "en" | "fr";
  const localePrefix = locale === "fr" ? "/fr" : "";
  const intakeFormUrl = `${appUrl}${localePrefix}/intake/${data.intakeFormToken}`;

  const subject =
    locale === "fr"
      ? "Action requise : remplissez votre formulaire avant votre rendez-vous – SNC Beauty Salon & Spa"
      : "Action required: complete your health form before your appointment – SNC Beauty Salon & Spa";

  const html = await render(
    React.createElement(IntakeReminderEmail, {
      clientFirstName: data.clientFirstName,
      appointmentDate: formatDate(data.appointmentDate, locale),
      services: data.services,
      intakeFormUrl,
      expiresAt: formatShortDate(data.intakeFormTokenExpiresAt, locale),
      locale,
    })
  );

  await deliver(data.clientEmail, subject, html);
}

// ── Cancellation email ─────────────────────────────────────────────────────────

export type CancellationEmailData = {
  clientFirstName: string;
  clientEmail: string;
  appointmentDate: Date;
  services: string[];
  locale: string;
};

export async function sendCancellationEmail(
  data: CancellationEmailData
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const locale = (data.locale === "fr" ? "fr" : "en") as "en" | "fr";
  const localePrefix = locale === "fr" ? "/fr" : "";
  const bookUrl = `${appUrl}${localePrefix}/book`;

  const subject =
    locale === "fr"
      ? "Votre rendez-vous a été annulé – SNC Beauty Salon & Spa"
      : "Your appointment has been cancelled – SNC Beauty Salon & Spa";

  const html = await render(
    React.createElement(CancellationEmail, {
      clientFirstName: data.clientFirstName,
      appointmentDate: formatDate(data.appointmentDate, locale),
      services: data.services,
      bookUrl,
      locale,
    })
  );

  await deliver(data.clientEmail, subject, html);
}
