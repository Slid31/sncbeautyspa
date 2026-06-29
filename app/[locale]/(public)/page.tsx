import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Sparkles } from "lucide-react";
import { ContactSection } from "./_components/contact-section";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const [, t] = await Promise.all([params, getTranslations("home")]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-fuchsia-200/30 blur-3xl"
        />

        <div className="relative max-w-5xl mx-auto px-6 py-24 sm:py-32 text-center">
          {/* Eyebrow */}
          <p className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            {t("hero.eyebrow")}
          </p>

          {/* Headline — supports \n line break */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight whitespace-pre-line mb-6">
            {t("hero.title")}
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed mb-10">
            {t("hero.subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/book`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-pink-600 text-white font-semibold text-base hover:bg-pink-700 active:scale-95 transition-all shadow-lg shadow-pink-200"
            >
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/services`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-slate-200 text-slate-700 font-semibold text-base hover:border-pink-300 hover:text-pink-700 transition-colors"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <ContactSection />
    </>
  );
}
