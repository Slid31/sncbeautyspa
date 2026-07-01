import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("policies");
  return { title: t("meta.title"), description: t("meta.description") };
}

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 mb-4">
        <i className={`ti ${icon} text-pink-500`} style={{ fontSize: 16 }} aria-hidden="true" />
        <h2 className="text-xs font-semibold tracking-widest uppercase text-pink-500">
          {title}
        </h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-justify">{children}</p>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 text-sm sm:text-base text-slate-600 leading-relaxed">
      <span className="text-pink-400 mt-1 shrink-0">•</span>
      <span className="text-justify">{children}</span>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
      <i className="ti ti-alert-triangle text-amber-500 shrink-0 mt-0.5" style={{ fontSize: 16 }} aria-hidden="true" />
      <p className="text-sm text-amber-800 leading-relaxed">{children}</p>
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
      <i className="ti ti-sparkles text-emerald-500 shrink-0 mt-0.5" style={{ fontSize: 16 }} aria-hidden="true" />
      <p className="text-sm text-emerald-800 leading-relaxed">{children}</p>
    </div>
  );
}

export default async function PoliciesPage() {
  const t = await getTranslations("policies");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <p className="text-xs font-semibold tracking-widest uppercase text-pink-500 mb-3">
          SNC Beauty Salon & Spa
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
          {t("title")}
        </h1>
        <p className="text-slate-500 text-base max-w-2xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6">

        {/* Reservations */}
        <Section icon="ti-calendar" title={t("reservations.title")}>
          <P>{t("reservations.p1")}</P>
          <Warning>{t("reservations.warning")}</Warning>
        </Section>

        {/* Discounts */}
        <Section icon="ti-tag" title={t("discounts.title")}>
          <P>{t("discounts.p1")}</P>
        </Section>

        {/* Gift Cards */}
        <Section icon="ti-gift" title={t("giftCards.title")}>
          <P>{t("giftCards.intro")}</P>
          <Bullet>{t("giftCards.b1")}</Bullet>
          <Bullet>{t("giftCards.b2")}</Bullet>
          <Bullet>{t("giftCards.b3")}</Bullet>
          <Bullet>{t("giftCards.b4")}</Bullet>
          <Highlight>{t("giftCards.highlight")}</Highlight>
        </Section>

        {/* Gratuities */}
        <Section icon="ti-cash" title={t("gratuities.title")}>
          <P>{t("gratuities.p1")}</P>
        </Section>

        {/* Payment */}
        <Section icon="ti-credit-card" title={t("payment.title")}>
          <P>{t("payment.p1")}</P>
        </Section>

        {/* Age */}
        <Section icon="ti-users" title={t("age.title")}>
          <Bullet>{t("age.b1")}</Bullet>
          <Bullet>{t("age.b2")}</Bullet>
          <Bullet>{t("age.b3")}</Bullet>
        </Section>

        {/* Refunds */}
        <Section icon="ti-receipt-refund" title={t("refunds.title")}>
          <Bullet>{t("refunds.b1")}</Bullet>
          <Bullet>{t("refunds.b2")}</Bullet>
          <Bullet>{t("refunds.b3")}</Bullet>
        </Section>

        {/* Late Arrivals */}
        <Section icon="ti-clock" title={t("lateArrivals.title")}>
          <Bullet>{t("lateArrivals.b1")}</Bullet>
          <Bullet>{t("lateArrivals.b2")}</Bullet>
          <Bullet>{t("lateArrivals.b3")}</Bullet>
        </Section>

        {/* Professional Boundaries */}
        <Section icon="ti-heart" title={t("boundaries.title")}>
          <P>{t("boundaries.p1")}</P>
          <Bullet>{t("boundaries.b1")}</Bullet>
        </Section>

        {/* Mobile SPA */}
        <Section icon="ti-car" title={t("mobileSpa.title")}>
          <P>{t("mobileSpa.p1")}</P>
          <P>{t("mobileSpa.p2")}</P>
        </Section>

        {/* SPA Parties */}
        <Section icon="ti-confetti" title={t("spaParties.title")}>
          <P>{t("spaParties.p1")}</P>
          <P>{t("spaParties.p2")}</P>
          <P>{t("spaParties.p3")}</P>
          <Bullet>{t("spaParties.b1")}</Bullet>
        </Section>

        {/* What we want to know */}
        <Section icon="ti-list-check" title={t("whatWeNeed.title")}>
          <Bullet>{t("whatWeNeed.b1")}</Bullet>
          <Bullet>{t("whatWeNeed.b2")}</Bullet>
          <Bullet>{t("whatWeNeed.b3")}</Bullet>
          <Bullet>{t("whatWeNeed.b4")}</Bullet>
        </Section>

        {/* Lost / Stolen */}
        <Section icon="ti-shield-x" title={t("lost.title")}>
          <P>{t("lost.p1")}</P>
          <P>{t("lost.p2")}</P>
        </Section>

        {/* Sexual Interaction */}
        <Section icon="ti-ban" title={t("sexual.title")}>
          <Warning>{t("sexual.warning")}</Warning>
        </Section>

      </div>

      <div className="mt-12 text-center space-y-3">
        <p className="text-base text-slate-700 font-medium">{t("closing")}</p>
        <p className="text-xs text-slate-400">{t("footer")}</p>
      </div>
    </div>
  );
}
