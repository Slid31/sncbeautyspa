"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendCancellationEmail } from "@/lib/email";

// ── Shared types ───────────────────────────────────────────────────────────────

export type AppointmentRow = {
  id: string;
  date: string; // ISO
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentStatus: "UNPAID" | "PAID";
  totalAmount: string; // toFixed(2)
  cancelToken: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  services: { name: string; price: string }[];
};

export type AppointmentDetailRow = Omit<AppointmentRow, "services"> & {
  services: { name: string; price: string; duration: number }[];
  intakeFormResponse: { responses: Record<string, unknown> } | null;
};

// ── getAppointments ───────────────────────────────────────────────────────────

export async function getAppointments(): Promise<AppointmentRow[]> {
  const rows = await prisma.appointment.findMany({
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      cancelToken: true,
      client: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      services: {
        select: {
          priceSnapshot: true,
          service: { select: { name: true } },
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    date: row.date.toISOString(),
    status: row.status as AppointmentRow["status"],
    paymentStatus: row.paymentStatus as AppointmentRow["paymentStatus"],
    totalAmount: row.totalAmount.toFixed(2),
    cancelToken: row.cancelToken,
    client: row.client,
    services: row.services.map((s) => ({
      name: s.service.name,
      price: s.priceSnapshot.toFixed(2),
    })),
  }));
}

// ── getAppointmentDetail ──────────────────────────────────────────────────────

export async function getAppointmentDetail(
  id: string
): Promise<AppointmentDetailRow | null> {
  const row = await prisma.appointment.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      cancelToken: true,
      client: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      services: {
        select: {
          priceSnapshot: true,
          service: { select: { name: true, duration: true } },
        },
      },
      intakeFormResponse: {
        select: { responses: true },
      },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    date: row.date.toISOString(),
    status: row.status as AppointmentRow["status"],
    paymentStatus: row.paymentStatus as AppointmentRow["paymentStatus"],
    totalAmount: row.totalAmount.toFixed(2),
    cancelToken: row.cancelToken,
    client: row.client,
    services: row.services.map((s) => ({
      name: s.service.name,
      price: s.priceSnapshot.toFixed(2),
      duration: s.service.duration,
    })),
    intakeFormResponse: row.intakeFormResponse
      ? {
          responses: JSON.parse(
            JSON.stringify(row.intakeFormResponse.responses)
          ) as Record<string, unknown>,
        }
      : null,
  };
}

// ── updateAppointmentStatus ───────────────────────────────────────────────────

export type UpdateStatusResult =
  | { ok: true }
  | { ok: false; error: "not_found" | "invalid_status" | "server_error" };

export async function updateAppointmentStatus(
  id: string,
  status: "COMPLETED" | "CANCELLED",
  locale: string
): Promise<UpdateStatusResult> {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      select: {
        status: true,
        date: true,
        client: { select: { firstName: true, email: true } },
        services: { select: { service: { select: { name: true } } } },
      },
    });

    if (!appt) return { ok: false, error: "not_found" };
    if (appt.status !== "CONFIRMED") return { ok: false, error: "invalid_status" };

    await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    if (status === "CANCELLED") {
      await sendCancellationEmail({
        clientFirstName: appt.client.firstName,
        clientEmail: appt.client.email,
        appointmentDate: appt.date,
        services: appt.services.map((s) => s.service.name),
        locale,
      });
    }

    revalidatePath("/admin/appointments");
    revalidatePath("/fr/admin/appointments");

    return { ok: true };
  } catch (e) {
    console.error("[updateAppointmentStatus]", e);
    return { ok: false, error: "server_error" };
  }
}
