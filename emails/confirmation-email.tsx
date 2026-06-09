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
} from "@react-email/components";

export type ConfirmationEmailProps = {
  clientFirstName: string;
  appointmentDate: string;
  services: { name: string; price: string }[];
  totalAmount: string;
  manageUrl: string;
  locale: "en" | "fr";
};

const copy = {
  en: {
    preview: "Your appointment at SNC Beauty Salon & Spa is confirmed!",
    heading: "You're all set!",
    tagline: "Your SNC Beauty Salon & Spa appointment is confirmed.",
    greeting: (n: string) => `Hi ${n},`,
    intro: "Here are your appointment details:",
    labelDate: "Date",
    labelServices: "Services",
    labelTotal: "Total paid",
    cta: "View My Appointment",
    cancelNote:
      "You can also cancel your appointment from this link up to 24 hours before your visit.",
    contact: "Questions? Feel free to contact us at the salon.",
    footer: "SNC Beauty Salon & Spa · See you soon!",
  },
  fr: {
    preview:
      "Votre rendez-vous au Salon de Beauté & Spa SNC est confirmé !",
    heading: "C'est confirmé !",
    tagline:
      "Votre rendez-vous au Salon de Beauté & Spa SNC est confirmé.",
    greeting: (n: string) => `Bonjour ${n},`,
    intro: "Voici les détails de votre rendez-vous :",
    labelDate: "Date",
    labelServices: "Services",
    labelTotal: "Total payé",
    cta: "Voir mon rendez-vous",
    cancelNote:
      "Ce lien vous permet aussi d'annuler votre rendez-vous jusqu'à 24 heures avant votre visite.",
    contact: "Des questions ? N'hésitez pas à nous contacter au salon.",
    footer: "SNC Beauty Salon & Spa · À bientôt !",
  },
};

export function ConfirmationEmail({
  clientFirstName,
  appointmentDate,
  services,
  totalAmount,
  manageUrl,
  locale,
}: ConfirmationEmailProps) {
  const c = copy[locale] ?? copy.en;

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{c.preview}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          {/* ── Pink header ── */}
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
              {/* Date */}
              <Text style={s.cardLabel}>{c.labelDate}</Text>
              <Text style={{ ...s.text, fontWeight: "600", marginBottom: "16px" }}>
                {appointmentDate}
              </Text>

              <Hr style={s.cardHr} />

              {/* Services header */}
              <Text style={s.cardLabel}>{c.labelServices}</Text>

              {/* Per-service rows */}
              {services.map((svc, i) => (
                <Row key={i} style={{ marginBottom: "6px" }}>
                  <Column style={{ ...s.text, margin: 0 }}>{svc.name}</Column>
                  <Column
                    style={{
                      ...s.text,
                      margin: 0,
                      textAlign: "right",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ${svc.price}
                  </Column>
                </Row>
              ))}

              <Hr style={s.cardHr} />

              {/* Total */}
              <Row>
                <Column style={{ ...s.text, fontWeight: "700", margin: 0 }}>
                  {c.labelTotal}
                </Column>
                <Column
                  style={{
                    ...s.text,
                    fontWeight: "700",
                    margin: 0,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  ${totalAmount} <span style={{ fontWeight: "400", color: "#94a3b8" }}>USD</span>
                </Column>
              </Row>
            </Section>

            {/* CTA */}
            <Button href={manageUrl} style={s.button}>
              {c.cta}
            </Button>

            <Text style={s.note}>{c.cancelNote}</Text>

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
    backgroundColor: "#fdf2f8",
    borderRadius: "12px 12px 0 0",
    padding: "32px 40px",
    borderBottom: "1px solid #fce7f3",
  },
  h1: {
    color: "#db2777",
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
  note: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 12px",
  },
  hr: {
    borderColor: "#e2e8f0",
    margin: "20px 0",
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
