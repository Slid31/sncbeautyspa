"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Shared view types ─────────────────────────────────────────────────────────

export type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  /** Stringified Decimal, e.g. "75.00" */
  price: string;
  duration: number;
  categoryId: string;
  categoryName: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  appointmentCount: number;
};

export type CategoryOption = {
  id: string;
  name: string;
};

// ── Validation ────────────────────────────────────────────────────────────────

const serviceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive().max(10_000),
  duration: z.coerce.number().int().min(1).max(480),
  categoryId: z.string().min(1),
  image: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  isActive: z.boolean().default(true),
});

export type ServiceFormData = z.input<typeof serviceSchema>;

// ── Result types ──────────────────────────────────────────────────────────────

type Ok = { ok: true };
// "failed" | "invalid_data" are incompatible with "has_appointments" — enables TS narrowing
type Fail = { ok: false; error: "failed" | "invalid_data" };
type HasAppointments = {
  ok: false;
  error: "has_appointments";
  appointmentCount: number;
};
export type ActionResult = Ok | Fail;
export type DeleteResult = Ok | HasAppointments | Fail;

// ── Helpers ───────────────────────────────────────────────────────────────────

function revalidate() {
  revalidatePath("/admin/services");
  revalidatePath("/fr/admin/services");
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createService(data: ServiceFormData): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "invalid_data" } satisfies Fail;

  const { name, description, price, duration, categoryId, image, isActive } =
    parsed.data;

  await prisma.service.create({
    data: {
      name: name.trim(),
      description: description?.trim() ?? null,
      price,
      duration,
      categoryId,
      image: image ?? null,
      isActive,
    },
  });

  revalidate();
  return { ok: true };
}

export async function updateService(
  id: string,
  data: ServiceFormData
): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "invalid_data" } satisfies Fail;

  const { name, description, price, duration, categoryId, image, isActive } =
    parsed.data;

  await prisma.service.update({
    where: { id },
    data: {
      name: name.trim(),
      description: description?.trim() ?? null,
      price,
      duration,
      categoryId,
      image: image ?? null,
      isActive,
    },
  });

  revalidate();
  return { ok: true };
}

export async function deleteService(id: string): Promise<DeleteResult> {
  const appointmentCount = await prisma.appointmentService.count({
    where: { serviceId: id },
  });

  if (appointmentCount > 0) {
    return { ok: false, error: "has_appointments", appointmentCount };
  }

  // IntakeForm cascades automatically (onDelete: Cascade on schema)
  await prisma.service.delete({ where: { id } });

  revalidate();
  return { ok: true };
}
