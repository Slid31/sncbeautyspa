import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ServicesClient } from "./_components/services-client";
import type { ServiceRow, CategoryOption } from "./actions";

export default async function AdminServicesPage() {
  await requireAuth();

  const [rawCategories, rawServices] = await Promise.all([
    prisma.serviceCategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
    prisma.service.findMany({
      orderBy: [{ categoryId: "asc" }, { order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        categoryId: true,
        image: true,
        isActive: true,
        order: true,
        createdAt: true,
        category: { select: { name: true } },
        _count: { select: { appointmentServices: true } },
      },
    }),
  ]);

  const categories: CategoryOption[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const services: ServiceRow[] = rawServices.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price.toFixed(2),
    duration: s.duration,
    categoryId: s.categoryId,
    categoryName: s.category.name,
    image: s.image,
    isActive: s.isActive,
    order: s.order,
    createdAt: s.createdAt.toISOString(),
    appointmentCount: s._count.appointmentServices,
  }));

  return <ServicesClient services={services} categories={categories} />;
}
