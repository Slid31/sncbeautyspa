import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
  Img,
} from "@react-email/components";

export type IntakeReminderEmailProps = {
  clientFirstName: string;
  appointmentDate: string;
  services: { name: string; duration: number }[];
  intakeFormUrl: string;
  expiresAt: string;
  locale: "en" | "fr";
};

// ── Copy ──────────────────────────────────────────────────────────────────────

const copy = {
  en: {
    preview: "Action required: complete your health form before your appointment",
    badge: "Action Required",
    heading: "Complete Your Health Form",
    tagline: "Your appointment is coming up — one last step before we see you.",
    greeting: (n: string) => `Hi ${n},`,
    body: "Your appointment is in less than 48 hours. To ensure we provide you with the best possible care, please take a moment to fill out your health & preferences form.",
    apptSection: "APPOINTMENT DETAILS",
    labelDate: "Date & Time",
    labelServices: "Services",
    minutes: "min",
    cta: "Complete My Form",
    mustComplete: "This form must be completed before your appointment.",
    expiresLabel: "Link expires on",
    cancelNote: "If you've already completed the form, please disregard this email.",
    footer: "SNC Beauty Salon & Spa · See you soon!",
  },
  fr: {
    preview: "Action requise : remplissez votre formulaire avant votre rendez-vous",
    badge: "Action Requise",
    heading: "Remplissez Votre Formulaire de Santé",
    tagline: "Votre rendez-vous approche — une dernière étape avant de vous accueillir.",
    greeting: (n: string) => `Bonjour ${n},`,
    body: "Votre rendez-vous est dans moins de 48 heures. Pour vous offrir les meilleurs soins possibles, veuillez prendre un moment pour remplir votre formulaire de santé et de préférences.",
    apptSection: "DÉTAILS DU RENDEZ-VOUS",
    labelDate: "Date et heure",
    labelServices: "Services",
    minutes: "min",
    cta: "Remplir Mon Formulaire",
    mustComplete: "Ce formulaire doit être rempli avant votre rendez-vous.",
    expiresLabel: "Ce lien expire le",
    cancelNote: "Si vous avez déjà rempli ce formulaire, veuillez ignorer ce message.",
    footer: "SNC Beauty Salon & Spa · À bientôt !",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function IntakeReminderEmail({
  clientFirstName,
  appointmentDate,
  services,
  intakeFormUrl,
  expiresAt,
  locale,
}: IntakeReminderEmailProps) {
  const c = copy[locale] ?? copy.en;

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{c.preview}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          {/* ── HEADER ── */}
          <Section style={s.header}>
            <Img
              src="https://www.sncbeautyfashion.com/trans_logo.png"
              alt="SNC Beauty Salon & Spa"
              width={80}
              height={80}
              style={{ margin: "0 auto 8px" }}
            />
            <Text style={s.badge}>{c.badge}</Text>
            <Heading style={s.h1}>{c.heading}</Heading>
            <Text style={s.tagline}>{c.tagline}</Text>
          </Section>

          {/* ── CONTENT ── */}
          <Section style={s.content}>
            <Text style={s.greeting}>{c.greeting(clientFirstName)}</Text>
            <Text style={s.text}>{c.body}</Text>

            {/* Appointment summary card */}
            <Section style={s.apptCard}>
              <Text style={s.sectionLabel}>{c.apptSection}</Text>

              <Text style={s.fieldLabel}>{c.labelDate}</Text>
              <Text style={s.fieldValue}>{appointmentDate}</Text>

              <Hr style={s.innerHr} />

              <Text style={s.fieldLabel}>{c.labelServices}</Text>
              {services.map((svc, i) => (
                <Row key={i} style={{ marginBottom: "5px" }}>
                  <Column style={{ ...s.text, margin: 0 }}>{svc.name}</Column>
                  <Column
                    style={{
                      ...s.text,
                      margin: 0,
                      textAlign: "right",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {svc.duration}&nbsp;{c.minutes}
                  </Column>
                </Row>
              ))}
            </Section>

            {/* CTA */}
            <Button href={intakeFormUrl} style={s.ctaButton}>
              {c.cta} →
            </Button>

            {/* Must-complete note */}
            <Section style={s.urgencyBox}>
              <Text style={s.urgencyText}>
                ⚠️&nbsp; {c.mustComplete}
              </Text>
            </Section>

            {/* Expiry warning */}
            <Text style={s.expiryNote}>
              ⏰&nbsp; <strong>{c.expiresLabel}:</strong> {expiresAt}
            </Text>

            <Hr style={s.divider} />

            <Text style={s.mutedNote}>{c.cancelNote}</Text>
          </Section>

          {/* ── FOOTER ── */}
          <Section style={s.footer}>
            <Text style={s.footerText}>{c.footer}</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  body: {
    backgroundColor: "#f1f5f9",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: "0",
    padding: "0",
  },
  container: {
    maxWidth: "520px",
    margin: "0 auto",
    padding: "32px 0 48px",
  },
  header: {
    background: "linear-gradient(135deg, #db2777 0%, #9d174d 100%)",
    borderRadius: "14px 14px 0 0",
    padding: "28px 36px 24px",
  },
  brandName: {
    color: "#fce7f3",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.04em",
    margin: "0 0 14px",
  },
  badge: {
    backgroundColor: "#fef08a",
    color: "#713f12",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    padding: "4px 12px",
    borderRadius: "20px",
    display: "inline-block",
    margin: "0 0 14px",
  },
  h1: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "800",
    margin: "0 0 8px",
    lineHeight: "1.25",
    letterSpacing: "-0.01em",
  },
  tagline: {
    color: "#fce7f3",
    fontSize: "13px",
    margin: "0",
    lineHeight: "1.5",
  },
  content: {
    backgroundColor: "#ffffff",
    padding: "28px 36px 32px",
    border: "1px solid #e2e8f0",
    borderTop: "none",
  },
  greeting: {
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: "600",
    lineHeight: "1.5",
    margin: "0 0 6px",
  },
  text: {
    color: "#334155",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 16px",
  },
  apptCard: {
    backgroundColor: "#fdf8ff",
    border: "1px solid #f3e8ff",
    borderRadius: "10px",
    padding: "18px 20px",
    margin: "4px 0 24px",
  },
  sectionLabel: {
    color: "#7c3aed",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    margin: "0 0 14px",
  },
  fieldLabel: {
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    margin: "0 0 5px",
  },
  fieldValue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 14px",
    lineHeight: "1.4",
  },
  innerHr: {
    borderColor: "#e2e8f0",
    margin: "12px 0",
  },
  ctaButton: {
    backgroundColor: "#7c3aed",
    borderRadius: "10px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "700",
    padding: "14px 36px",
    textDecoration: "none",
    marginBottom: "20px",
    letterSpacing: "0.01em",
  },
  urgencyBox: {
    backgroundColor: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    padding: "12px 16px",
    margin: "0 0 14px",
  },
  urgencyText: {
    color: "#9a3412",
    fontSize: "13px",
    fontWeight: "600",
    lineHeight: "1.5",
    margin: "0",
  },
  expiryNote: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 14px",
  },
  divider: {
    borderColor: "#e2e8f0",
    margin: "20px 0",
  },
  mutedNote: {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "0",
  },
  footer: {
    backgroundColor: "#0f172a",
    borderRadius: "0 0 14px 14px",
    padding: "20px 36px",
    textAlign: "center" as const,
  },
  footerText: {
    color: "#94a3b8",
    fontSize: "12px",
    margin: "0",
    lineHeight: "1.5",
  },
};
