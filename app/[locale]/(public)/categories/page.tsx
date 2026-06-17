import Link from "next/link";
import { ImageOff, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      _count: { select: { services: { where: { isActive: true } } } },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          Nos catégories
        </h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          Explorez nos catégories de services et réservez en ligne.
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="text-center text-slate-400 py-16">Aucune catégorie disponible.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/services`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white hover:border-pink-200 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ImageOff className="h-10 w-10 text-slate-300" />
                )}
              </div>

              <div className="flex-1 p-5 space-y-2">
                <h2 className="font-semibold text-slate-900 text-lg group-hover:text-pink-700 transition-colors">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {cat.description}
                  </p>
                )}
                <p className="text-xs text-slate-400">
                  {cat._count.services} service{cat._count.services !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="px-5 pb-5">
                <span className="flex items-center justify-center gap-1.5 py-2 rounded-full bg-pink-50 text-pink-700 text-sm font-medium group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  Voir les services <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
