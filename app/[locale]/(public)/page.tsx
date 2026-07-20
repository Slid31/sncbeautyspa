import { getTranslations } from "next-intl/server";
import { ContactSection } from "./_components/contact-section";
import { HeroSlider } from "./_components/hero-slider";
import { SocialBanner } from "./_components/social-banner";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("home")]);
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? "/book";

  return (
    <>
      {/* ── Hero Slider ───────────────────────────────────────────────── */}
      <HeroSlider
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        eyebrow={t("hero.eyebrow")}
        cta={t("hero.cta")}
        ctaSecondary={t("hero.ctaSecondary")}
        bookingUrl={bookingUrl}
        servicesHref={`/${locale}/services`}
      />

      {/* ── Social Banner ────────────────────────────────────────────── */}
      <SocialBanner />

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <ContactSection />
    </>
  );
}
