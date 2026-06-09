import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Clock, DollarSign, ArrowRight, ImageOff, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ContactSection } from "./_components/contact-section";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("home")]);
  const ts = await getTranslations("services");
  const base = locale === "fr" ? "/fr" : "";

  const featured = await prisma.service.findMany({
    where: { isActive: true },
    take: 3,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      duration: true,
      image: true,
      category: { select: { name: true } },
    },
  });

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
              href={`${base}/book`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-pink-600 text-white font-semibold text-base hover:bg-pink-700 active:scale-95 transition-all shadow-lg shadow-pink-200"
            >
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`${base}/services`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-slate-200 text-slate-700 font-semibold text-base hover:border-pink-300 hover:text-pink-700 transition-colors"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured services ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {t("featuredServices")}
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            {t("featuredSubtitle")}
          </p>
        </div>

        {featured.length === 0 ? (
          <p className="text-center text-slate-400">{t("noServices")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((svc) => (
              <Link
                key={svc.id}
                href={`${base}/services/${svc.id}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white hover:border-pink-200 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Image */}
                <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {svc.image ? (
                    <img
                      src={svc.image}
                      alt={svc.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ImageOff className="h-10 w-10 text-slate-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-5 space-y-3">
                  <p className="text-xs font-medium text-pink-600 uppercase tracking-wide">
                    {svc.category.name}
                  </p>
                  <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-pink-700 transition-colors">
                    {svc.name}
                  </h3>
                  {svc.description && (
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {svc.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-1 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      {parseFloat(svc.price.toString()).toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {ts("durationUnit", { count: svc.duration })}
                    </span>
                  </div>
                </div>

                {/* Book CTA */}
                <div className="px-5 pb-5">
                  <span className="block text-center py-2 rounded-full bg-pink-50 text-pink-700 text-sm font-medium group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    {ts("bookNow")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View all link */}
        <div className="text-center mt-10">
          <Link
            href={`${base}/services`}
            className="inline-flex items-center gap-2 text-pink-600 font-semibold hover:text-pink-800 transition-colors"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <ContactSection />
    </>
  );
}
