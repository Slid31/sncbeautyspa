import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { CategoriesClient } from "./_components/categories-client";
import type { CategoryRow } from "./actions";

export default async function AdminCategoriesPage() {
  await requireAuth();

  const raw = await prisma.serviceCategory.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      createdAt: true,
      _count: { select: { services: true } },
    },
  });

  const categories: CategoryRow[] = raw.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    image: cat.image,
    createdAt: cat.createdAt.toISOString(),
    serviceCount: cat._count.services,
  }));

  return <CategoriesClient categories={categories} />;
}
