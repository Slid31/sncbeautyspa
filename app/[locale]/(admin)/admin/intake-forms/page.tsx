import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { CategoriesListClient } from "./_components/services-list";
import type { CategoryListItem } from "./actions";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminIntakeFormsPage({ params }: Props) {
  const [{ locale }] = await Promise.all([params, requireAuth()]);

  const raw = await prisma.serviceCategory.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: { select: { services: true } },
      intakeForm: { select: { id: true } },
    },
  });

  const categories: CategoryListItem[] = raw.map((c) => ({
    id: c.id,
    name: c.name,
    serviceCount: c._count.services,
    formId: c.intakeForm?.id ?? null,
  }));

  return <CategoriesListClient categories={categories} locale={locale} />;
}
