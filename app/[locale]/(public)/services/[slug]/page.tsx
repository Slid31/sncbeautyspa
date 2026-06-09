import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Clock, DollarSign, ImageOff, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ServiceDetailPage({ params }: Props) {
  const [{ locale, slug }, t] = await Promise.all([
    params,
    getTranslations("services"),
  ]);

  const base = locale === "fr" ? "/fr" : "";

  const service = await prisma.service.findUnique({
    where: { id: slug, isActive: true },
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

  if (!service) notFound();

  const price = service.price.toFixed(2);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Back link */}
      <Link
        href={`${base}/services`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-pink-600 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToServices")}
      </Link>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ── Image ── */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-square flex items-center justify-center">
            {service.image ? (
              <img
                src={service.image}
                alt={service.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageOff className="h-16 w-16 text-slate-300" />
            )}
          </div>
        </div>

        {/* ── Details ── */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Category pill */}
          <Badge
            variant="outline"
            className="self-start flex items-center gap-1 border-pink-200 bg-pink-50 text-pink-700"
          >
            <Tag className="h-3 w-3" />
            {service.category.name}
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            {service.name}
          </h1>

          {/* Price + Duration */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("price")}</p>
                <p className="text-xl font-bold text-slate-900">${price}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("duration")}</p>
                <p className="text-xl font-bold text-slate-900">
                  {t("durationUnit", { count: service.duration })}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <p className="text-slate-600 leading-relaxed">{service.description}</p>
          )}

          {/* Book CTA */}
          <div className="mt-auto pt-2">
            <Link
              href={`${base}/book/${service.id}`}
              className="inline-flex items-center justify-center w-full sm:w-auto px-10 py-3.5 rounded-full bg-pink-600 text-white font-semibold text-base hover:bg-pink-700 active:scale-95 transition-all shadow-lg shadow-pink-200"
            >
              {t("bookNow")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
