import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { CategoriesView, type CategoryItem } from "./_components/categories-view";

type Props = { params: Promise<{ locale: string }> };

export default async function ServicesPage({ params }: Props) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("services")]);

  const raw = await prisma.serviceCategory.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      services: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          duration: true,
          image: true,
        },
      },
    },
  });

  // Only show categories that have at least one active service
  const categories: CategoryItem[] = raw
    .filter((cat) => cat.services.length > 0)
    .map((cat) => ({
      ...cat,
      services: cat.services.map((svc) => ({
        ...svc,
        price: svc.price.toFixed(2),
      })),
    }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          {t("title")}
        </h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="text-center text-slate-400 py-16">{t("noResults")}</p>
      ) : (
        <CategoriesView categories={categories} locale={locale} />
      )}
    </div>
  );
}
