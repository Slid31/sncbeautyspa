"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  image: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  order: z.coerce.number().int().min(0).default(0),
});

export type CategoryFormData = z.input<typeof categorySchema>;

export type CategoryRow = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  order: number;
  createdAt: string;
  serviceCount: number;
};

type Ok = { ok: true };
type Err = { ok: false; error: string };
export type ActionResult = Ok | Err;
export type DeleteResult =
  | Ok
  | { ok: false; error: "has_appointments"; appointmentCount: number }
  | Err;

function revalidate() {
  revalidatePath("/admin/categories");
  revalidatePath("/fr/admin/categories");
}

export async function createCategory(data: CategoryFormData): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "invalid_data" };

  const { name, description, image, order } = parsed.data;
  await prisma.serviceCategory.create({
    data: {
      name: name.trim(),
      description: description?.trim() ?? null,
      image: image ?? null,
      order,
    },
  });

  revalidate();
  return { ok: true };
}

export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "invalid_data" };

  const { name, description, image, order } = parsed.data;
  await prisma.serviceCategory.update({
    where: { id },
    data: {
      name: name.trim(),
      description: description?.trim() ?? null,
      image: image ?? null,
      order,
    },
  });

  revalidate();
  return { ok: true };
}

export async function reorderCategories(orderedIds: string[]): Promise<ActionResult> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.serviceCategory.update({ where: { id }, data: { order: index } })
    )
  );
  revalidate();
  revalidatePath("/en/services");
  revalidatePath("/fr/services");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<DeleteResult> {
  const services = await prisma.service.findMany({
    where: { categoryId: id },
    select: {
      id: true,
      _count: { select: { appointmentServices: true } },
    },
  });

  const aptCount = services.reduce(
    (sum, s) => sum + s._count.appointmentServices,
    0
  );

  if (aptCount > 0) {
    return { ok: false, error: "has_appointments", appointmentCount: aptCount };
  }

  await prisma.$transaction(async (tx) => {
    if (services.length > 0) {
      const ids = services.map((s) => s.id);
      await tx.service.deleteMany({ where: { categoryId: id } });
    }
    await tx.serviceCategory.delete({ where: { id } });
  });

  revalidate();
  return { ok: true };
}
