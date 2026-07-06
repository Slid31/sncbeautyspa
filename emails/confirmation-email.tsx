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
  Link,
  Img,
} from "@react-email/components";

export type ConfirmationEmailProps = {
  clientFirstName: string;
  appointmentDate: string;
  paymentDate: string;
  services: { name: string; duration: number; price: string }[];
  totalAmount: string;
  manageUrl: string;
  intakeFormUrl?: string;
  transactionRef: string;
  cardLast4?: string;
  salonPhone?: string;
  salonEmail: string;
  salonAddress: string;
  locale: "en" | "fr";
};

// ── Copy ──────────────────────────────────────────────────────────────────────

const copy = {
  en: {
    preview: "Your appointment is confirmed — payment receipt inside",
    title: "Appointment Confirmed & Payment Receipt",
    greeting: (n: string) => `Hi ${n},`,
    intro: "Your appointment at SNC Beauty Salon & Spa is confirmed and payment received. We look forward to seeing you!",
    appointmentSection: "APPOINTMENT DETAILS",
    labelDate: "Date & Time",
    labelServices: "Services",
    labelLocation: "Location",
    minutes: "min",
    receiptSection: "PAYMENT RECEIPT",
    paid: "PAID",
    transactionNo: "Transaction #",
    paymentDateLabel: "Payment Date",
    subtotal: "Subtotal",
    labelTotal: "Total Paid",
    paymentMethod: "Payment Method",
    card: (last4?: string) => last4 ? `Card ending in ${last4}` : "Card",
    cta: "View My Appointment",
    intakeFormHeading: "Complete Your Health Form",
    intakeFormNote:
      "Before your visit, please fill out your health & preferences form. The link expires the day before your appointment.",
    intakeFormCta: "Fill Out Intake Form",
    tips: "Tips accepted via Cash, Venmo, CashApp or Zelle — thank you for your generosity!",
    cancelNote: "Need to cancel? You can do so up to 24 hours before your appointment:",
    cancelLink: "Cancel my appointment",
    contact: "Questions? We're here to help.",
    footerTagline: "Thank you for choosing SNC Beauty Salon & Spa — see you soon!",
    rights: `© ${new Date().getFullYear()} SNC Beauty Salon & Spa. All rights reserved.`,
  },
  fr: {
    preview: "Votre rendez-vous est confirmé — reçu de paiement inclus",
    title: "Rendez-vous Confirmé & Reçu de Paiement",
    greeting: (n: string) => `Bonjour ${n},`,
    intro: "Votre rendez-vous au Salon de Beauté & Spa SNC est confirmé et votre paiement a été reçu. Nous avons hâte de vous accueillir !",
    appointmentSection: "DÉTAILS DU RENDEZ-VOUS",
    labelDate: "Date et heure",
    labelServices: "Services",
    labelLocation: "Lieu",
    minutes: "min",
    receiptSection: "REÇU DE PAIEMENT",
    paid: "PAYÉ",
    transactionNo: "Transaction nº",
    paymentDateLabel: "Date de paiement",
    subtotal: "Sous-total",
    labelTotal: "Total payé",
    paymentMethod: "Mode de paiement",
    card: (last4?: string) => last4 ? `Carte se terminant par ${last4}` : "Carte",
    cta: "Voir mon rendez-vous",
    intakeFormHeading: "Remplissez votre formulaire de santé",
    intakeFormNote:
      "Avant votre visite, veuillez remplir votre formulaire de santé et préférences. Le lien expire la veille de votre rendez-vous.",
    intakeFormCta: "Remplir le formulaire",
    tips: "Les pourboires sont acceptés en espèces, Venmo, CashApp ou Zelle — merci de votre générosité !",
    cancelNote: "Besoin d'annuler ? Vous pouvez le faire jusqu'à 24 heures avant votre rendez-vous :",
    cancelLink: "Annuler mon rendez-vous",
    contact: "Des questions ? Nous sommes là pour vous aider.",
    footerTagline: "Merci de choisir le Salon de Beauté & Spa SNC — à bientôt !",
    rights: `© ${new Date().getFullYear()} SNC Beauty Salon & Spa. Tous droits réservés.`,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ConfirmationEmail({
  clientFirstName,
  appointmentDate,
  paymentDate,
  services,
  totalAmount,
  manageUrl,
  intakeFormUrl,
  transactionRef,
  cardLast4,
  salonPhone,
  salonEmail,
  salonAddress,
  locale,
}: ConfirmationEmailProps) {
  const c = copy[locale] ?? copy.en;
  const subtotal = services
    .reduce((sum, s) => sum + parseFloat(s.price), 0)
    .toFixed(2);

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
            <Heading style={s.h1}>{c.title}</Heading>
          </Section>

          {/* ── MAIN CONTENT ── */}
          <Section style={s.content}>
            <Text style={s.greeting}>{c.greeting(clientFirstName)}</Text>
            <Text style={s.text}>{c.intro}</Text>

            {/* ── APPOINTMENT SECTION ── */}
            <Section style={s.apptCard}>
              <Text style={s.sectionLabel}>{c.appointmentSection}</Text>

              {/* Date */}
              <Text style={s.fieldLabel}>{c.labelDate}</Text>
              <Text style={s.fieldValue}>{appointmentDate}</Text>

              <Hr style={s.innerHr} />

              {/* Services with duration */}
              <Text style={s.fieldLabel}>{c.labelServices}</Text>
              {services.map((svc, i) => (
                <Row key={i} style={{ marginBottom: "5px" }}>
                  <Column style={{ ...s.text, margin: 0, paddingRight: "8px" }}>
                    {svc.name}
                  </Column>
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

              <Hr style={s.innerHr} />

              {/* Location */}
              <Text style={s.fieldLabel}>{c.labelLocation}</Text>
              <Text style={{ ...s.text, margin: "0 0 2px", fontWeight: "600" }}>
                SNC Beauty Salon &amp; Spa
              </Text>
              <Text style={{ ...s.text, color: "#64748b", margin: 0 }}>
                {salonAddress}
              </Text>
            </Section>

            {/* ── RECEIPT SECTION ── */}
            <Section style={s.receiptCard}>
              {/* Header row: section label + PAID badge */}
              <Row style={{ marginBottom: "12px" }}>
                <Column>
                  <Text style={{ ...s.sectionLabel, margin: 0 }}>
                    {c.receiptSection}
                  </Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={s.paidBadge}>{c.paid}</Text>
                </Column>
              </Row>

              {/* Transaction # */}
              <Row style={{ marginBottom: "4px" }}>
                <Column style={{ width: "55%" }}>
                  <Text style={{ ...s.metaLabel, margin: 0 }}>
                    {c.transactionNo}
                  </Text>
                </Column>
                <Column style={{ width: "45%", textAlign: "right" }}>
                  <Text style={{ ...s.metaMono, margin: 0 }}>
                    {transactionRef}
                  </Text>
                </Column>
              </Row>

              {/* Payment date */}
              <Row style={{ marginBottom: "14px" }}>
                <Column style={{ width: "55%" }}>
                  <Text style={{ ...s.metaLabel, margin: 0 }}>
                    {c.paymentDateLabel}
                  </Text>
                </Column>
                <Column style={{ width: "45%", textAlign: "right" }}>
                  <Text style={{ ...s.metaValue, margin: 0 }}>
                    {paymentDate}
                  </Text>
                </Column>
              </Row>

              <Hr style={s.innerHr} />

              {/* Line items */}
              {services.map((svc, i) => (
                <Row key={i} style={{ marginBottom: "6px" }}>
                  <Column style={{ ...s.text, margin: 0 }}>{svc.name}</Column>
                  <Column
                    style={{
                      ...s.text,
                      margin: 0,
                      textAlign: "right",
                      fontWeight: "500",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ${svc.price}
                  </Column>
                </Row>
              ))}

              {/* Subtotal row (shows only when more than one service) */}
              {services.length > 1 && (
                <Row style={{ marginTop: "8px" }}>
                  <Column style={{ ...s.text, margin: 0, color: "#64748b" }}>
                    {c.subtotal}
                  </Column>
                  <Column
                    style={{
                      ...s.text,
                      margin: 0,
                      textAlign: "right",
                      color: "#64748b",
                    }}
                  >
                    ${subtotal}
                  </Column>
                </Row>
              )}

              <Hr style={s.innerHr} />

              {/* Total */}
              <Row style={{ marginBottom: "14px" }}>
                <Column
                  style={{
                    ...s.text,
                    margin: 0,
                    fontWeight: "700",
                    fontSize: "15px",
                  }}
                >
                  {c.labelTotal}
                </Column>
                <Column
                  style={{
                    ...s.text,
                    margin: 0,
                    textAlign: "right",
                    fontWeight: "700",
                    fontSize: "15px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ${totalAmount}&nbsp;
                  <span style={{ fontWeight: "400", color: "#94a3b8", fontSize: "12px" }}>
                    USD
                  </span>
                </Column>
              </Row>

              <Hr style={s.innerHr} />

              {/* Payment method */}
              <Row>
                <Column>
                  <Text style={{ ...s.metaLabel, margin: 0 }}>
                    {c.paymentMethod}
                  </Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={{ ...s.metaValue, margin: 0 }}>
                    {cardLast4
                      ? `···· ···· ···· ${cardLast4}`
                      : c.card(cardLast4)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* ── CTA ── */}
            <Button href={manageUrl} style={s.primaryButton}>
              {c.cta}
            </Button>

            {/* ── INTAKE FORM ── */}
            {intakeFormUrl && (
              <>
                <Hr style={s.divider} />
                <Text style={s.intakeHeading}>{c.intakeFormHeading}</Text>
                <Text style={s.note}>{c.intakeFormNote}</Text>
                <Button href={intakeFormUrl} style={s.intakeButton}>
                  {c.intakeFormCta}
                </Button>
              </>
            )}

            <Hr style={s.divider} />

            {/* ── TIPS NOTE ── */}
            <Section style={s.tipsBox}>
              <Text style={s.tipsText}>{c.tips}</Text>
            </Section>

            <Hr style={s.divider} />

            {/* ── CANCEL LINK ── */}
            <Text style={s.note}>
              {c.cancelNote}{" "}
              <Link href={manageUrl} style={s.cancelLink}>
                {c.cancelLink}
              </Link>
            </Text>

            <Text style={s.note}>{c.contact}</Text>
          </Section>

          {/* ── FOOTER ── */}
          <Section style={s.footer}>
            <Text style={s.footerBrand}>✂ SNC Beauty Salon &amp; Spa</Text>
            <Text style={s.footerTagline}>{c.footerTagline}</Text>
            <Hr style={{ ...s.innerHr, margin: "12px 0" }} />
            {salonPhone && (
              <Text style={s.footerContact}>📞&nbsp;{salonPhone}</Text>
            )}
            <Text style={s.footerContact}>📧&nbsp;{salonEmail}</Text>
            <Text style={s.footerContact}>📍&nbsp;{salonAddress}</Text>
            <Text style={s.footerLegal}>{c.rights}</Text>
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
    maxWidth: "560px",
    margin: "0 auto",
    padding: "32px 0 48px",
  },

  // Header
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
    margin: "0 0 12px",
  },
  h1: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "800",
    margin: "0",
    lineHeight: "1.25",
    letterSpacing: "-0.01em",
  },

  // Content wrapper
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
    margin: "0 0 12px",
  },

  // Appointment card
  apptCard: {
    backgroundColor: "#fdf8ff",
    border: "1px solid #f3e8ff",
    borderRadius: "10px",
    padding: "18px 20px",
    margin: "18px 0",
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

  // Receipt card
  receiptCard: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "18px 20px",
    margin: "0 0 20px",
  },
  paidBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.06em",
    padding: "3px 10px",
    borderRadius: "20px",
    border: "1px solid #bbf7d0",
    display: "inline-block",
    margin: "0",
  },
  metaLabel: {
    color: "#64748b",
    fontSize: "12px",
    margin: "0 0 4px",
  },
  metaValue: {
    color: "#334155",
    fontSize: "12px",
    fontWeight: "500",
    margin: "0 0 4px",
  },
  metaMono: {
    color: "#334155",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: '"Courier New", Courier, monospace',
    margin: "0 0 4px",
  },

  // Buttons
  primaryButton: {
    backgroundColor: "#db2777",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "600",
    padding: "12px 28px",
    textDecoration: "none",
    marginBottom: "8px",
  },
  intakeButton: {
    backgroundColor: "#7c3aed",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "600",
    padding: "12px 28px",
    textDecoration: "none",
    marginBottom: "8px",
  },
  intakeHeading: {
    color: "#4c1d95",
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 6px",
  },

  // Notes / dividers
  divider: {
    borderColor: "#e2e8f0",
    margin: "20px 0",
  },
  note: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.55",
    margin: "0 0 10px",
  },
  cancelLink: {
    color: "#db2777",
    textDecoration: "underline",
  },

  // Tips box
  tipsBox: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "12px 16px",
  },
  tipsText: {
    color: "#92400e",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0",
  },

  // Footer
  footer: {
    backgroundColor: "#0f172a",
    borderRadius: "0 0 14px 14px",
    padding: "24px 36px",
    textAlign: "center" as const,
  },
  footerBrand: {
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 4px",
    letterSpacing: "0.02em",
  },
  footerTagline: {
    color: "#94a3b8",
    fontSize: "12px",
    margin: "0 0 8px",
    lineHeight: "1.5",
  },
  footerContact: {
    color: "#94a3b8",
    fontSize: "12px",
    margin: "0 0 3px",
    lineHeight: "1.5",
  },
  footerLegal: {
    color: "#475569",
    fontSize: "11px",
    margin: "10px 0 0",
  },
};
