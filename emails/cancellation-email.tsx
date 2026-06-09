import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
} from "@react-email/components";

export type CancellationEmailProps = {
  clientFirstName: string;
  appointmentDate: string;
  services: string[];
  bookUrl: string;
  locale: "en" | "fr";
};

const copy = {
  en: {
    preview: "Your appointment at SNC Beauty Salon & Spa has been cancelled.",
    heading: "Appointment Cancelled",
    tagline: "Your appointment has been successfully cancelled.",
    greeting: (n: string) => `Hi ${n},`,
    intro: "Here are the details of your cancelled appointment:",
    labelDate: "Date",
    labelServices: "Services",
    rebook:
      "We're sorry to see you go! We hope to welcome you back soon.",
    cta: "Book a New Appointment",
    contact:
      "If you have any questions or need assistance, please don't hesitate to contact the salon.",
    footer: "SNC Beauty Salon & Spa",
  },
  fr: {
    preview:
      "Votre rendez-vous au Salon de Beauté & Spa SNC a été annulé.",
    heading: "Rendez-vous annulé",
    tagline: "Votre rendez-vous a été annulé avec succès.",
    greeting: (n: string) => `Bonjour ${n},`,
    intro: "Voici les détails du rendez-vous annulé :",
    labelDate: "Date",
    labelServices: "Services",
    rebook:
      "Nous espérons vous accueillir à nouveau très bientôt !",
    cta: "Prendre un nouveau rendez-vous",
    contact:
      "Si vous avez des questions ou besoin d'aide, n'hésitez pas à contacter le salon.",
    footer: "SNC Beauty Salon & Spa",
  },
};

export function CancellationEmail({
  clientFirstName,
  appointmentDate,
  services,
  bookUrl,
  locale,
}: CancellationEmailProps) {
  const c = copy[locale] ?? copy.en;

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{c.preview}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          {/* ── Muted rose header ── */}
          <Section style={s.header}>
            <Heading style={s.h1}>{c.heading}</Heading>
            <Text style={s.tagline}>{c.tagline}</Text>
          </Section>

          {/* ── Content ── */}
          <Section style={s.content}>
            <Text style={s.text}>{c.greeting(clientFirstName)}</Text>
            <Text style={s.text}>{c.intro}</Text>

            {/* Details card */}
            <Section style={s.card}>
              <Text style={s.cardLabel}>{c.labelDate}</Text>
              <Text style={{ ...s.text, fontWeight: "600", marginBottom: "16px" }}>
                {appointmentDate}
              </Text>

              <Hr style={s.cardHr} />

              <Text style={s.cardLabel}>{c.labelServices}</Text>
              {services.map((name, i) => (
                <Text key={i} style={{ ...s.text, margin: "0 0 4px" }}>
                  · {name}
                </Text>
              ))}
            </Section>

            <Text style={s.rebookText}>{c.rebook}</Text>

            {/* CTA */}
            <Button href={bookUrl} style={s.button}>
              {c.cta}
            </Button>

            <Hr style={s.hr} />

            <Text style={s.note}>{c.contact}</Text>
          </Section>

          {/* ── Footer ── */}
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
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#fff1f2",
    borderRadius: "12px 12px 0 0",
    padding: "32px 40px",
    borderBottom: "1px solid #fecdd3",
  },
  h1: {
    color: "#e11d48",
    fontSize: "26px",
    fontWeight: "700",
    margin: "0 0 8px",
    lineHeight: "1.2",
  },
  tagline: {
    color: "#475569",
    fontSize: "14px",
    margin: "0",
    lineHeight: "1.5",
  },
  content: {
    backgroundColor: "#ffffff",
    padding: "32px 40px",
    borderRadius: "0 0 12px 12px",
    border: "1px solid #f1f5f9",
    borderTop: "none",
  },
  text: {
    color: "#334155",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 12px",
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "20px 24px",
    margin: "4px 0 24px",
    border: "1px solid #e2e8f0",
  },
  cardLabel: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    margin: "0 0 6px",
  },
  cardHr: {
    borderColor: "#e2e8f0",
    margin: "14px 0",
  },
  rebookText: {
    color: "#334155",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 20px",
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#db2777",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "600",
    padding: "12px 28px",
    textDecoration: "none",
    marginBottom: "16px",
  },
  hr: {
    borderColor: "#e2e8f0",
    margin: "20px 0",
  },
  note: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 12px",
  },
  footer: {
    padding: "20px 40px 0",
    textAlign: "center" as const,
  },
  footerText: {
    color: "#94a3b8",
    fontSize: "12px",
    margin: "0",
    lineHeight: "1.5",
  },
};
