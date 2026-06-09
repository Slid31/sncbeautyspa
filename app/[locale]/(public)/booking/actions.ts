"use server";

import Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail, sendCancellationEmail } from "@/lib/email";

// ── Shared type ────────────────────────────────────────────────────────────────

export type AppointmentDetail = {
  id: string;
  cancelToken: string;
  date: Date;
  /** Raw enum string from DB */
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentStatus: "UNPAID" | "PAID";
  totalAmount: string; // toFixed(2)
  client: { firstName: string; lastName: string; email: string; phone: string | null };
  services: { name: string; price: string; duration: number }[];
  /** Eligible to cancel (not cancelled, not completed, not < 24h away) */
  canCancel: boolean;
  /** Appointment is < 24h away but not yet past */
  tooLate: boolean;
};

// ── getAppointmentByToken ─────────────────────────────────────────────────────

export type GetResult =
  | { ok: true; appointment: AppointmentDetail }
  | { ok: false; error: "not_found" };

export async function getAppointmentByToken(token: string): Promise<GetResult> {
  if (!token) return { ok: false, error: "not_found" };

  const appt = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    select: {
      id: true,
      cancelToken: true,
      date: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      client: {
        select: { firstName: true, lastName: true, email: true, phone: true },
      },
      services: {
        select: {
          priceSnapshot: true,
          service: { select: { name: true, duration: true } },
        },
      },
    },
  });

  if (!appt) return { ok: false, error: "not_found" };

  const now = Date.now();
  const msUntil = appt.date.getTime() - now;
  const hoursUntil = msUntil / (1000 * 60 * 60);

  const alreadyDone =
    appt.status === "CANCELLED" || appt.status === "COMPLETED";
  const tooLate = !alreadyDone && hoursUntil < 24;
  const canCancel = !alreadyDone && !tooLate;

  return {
    ok: true,
    appointment: {
      id: appt.id,
      cancelToken: appt.cancelToken,
      date: appt.date,
      status: appt.status as AppointmentDetail["status"],
      paymentStatus: appt.paymentStatus as AppointmentDetail["paymentStatus"],
      totalAmount: appt.totalAmount.toFixed(2),
      client: appt.client,
      services: appt.services.map((s) => ({
        name: s.service.name,
        price: s.priceSnapshot.toFixed(2),
        duration: s.service.duration,
      })),
      canCancel,
      tooLate,
    },
  };
}

// ── cancelAppointment ─────────────────────────────────────────────────────────

export type CancelResult =
  | { ok: true }
  | {
      ok: false;
      error: "not_found" | "already_cancelled" | "completed" | "too_late" | "failed";
    };

export async function cancelAppointment(
  token: string,
  locale: string
): Promise<CancelResult> {
  if (!token) return { ok: false, error: "not_found" };

  const appt = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    select: {
      id: true,
      date: true,
      status: true,
      totalAmount: true,
      client: { select: { firstName: true, email: true } },
      services: { select: { service: { select: { name: true } } } },
    },
  });

  if (!appt) return { ok: false, error: "not_found" };
  if (appt.status === "CANCELLED") return { ok: false, error: "already_cancelled" };
  if (appt.status === "COMPLETED") return { ok: false, error: "completed" };

  const hoursUntil = (appt.date.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) return { ok: false, error: "too_late" };

  try {
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { status: "CANCELLED" },
    });

    // Invalidate admin caches
    revalidatePath("/admin/appointments");
    revalidatePath("/fr/admin/appointments");

    await sendCancellationEmail({
      clientFirstName: appt.client.firstName,
      clientEmail: appt.client.email,
      appointmentDate: appt.date,
      services: appt.services.map((s) => s.service.name),
      locale,
    });

    return { ok: true };
  } catch (e) {
    console.error("[cancel] cancelAppointment error:", e);
    return { ok: false, error: "failed" };
  }
}

// ── confirmBySession ──────────────────────────────────────────────────────────
// Page-side fallback: verifies the Stripe session and idempotently confirms the
// appointment in case the webhook fires after the client lands on the success URL.
// Safe to call multiple times — guarded by `paymentStatus: "UNPAID"`.

export async function confirmBySession(
  sessionId: string,
  locale: string
): Promise<void> {
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) return;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") return;

    const { appointmentId } = session.metadata ?? {};
    if (!appointmentId) return;

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : null;

    // Idempotent: only runs when still UNPAID
    const updated = await prisma.appointment.updateMany({
      where: { id: appointmentId, paymentStatus: "UNPAID" },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
      },
    });

    if (updated.count === 0) return; // webhook already handled it

    // Create Transaction (may already exist from webhook — ignore duplicate)
    try {
      await prisma.transaction.create({
        data: {
          appointmentId,
          amount: (session.amount_total ?? 0) / 100,
          currency: (session.currency ?? "usd").toUpperCase(),
          ...(paymentIntentId ? { stripeChargeId: paymentIntentId } : {}),
          status: "SUCCEEDED",
        },
      });
    } catch {
      // Unique constraint: already created by webhook — safe to ignore.
    }

    // Send email (only reached when this is the first confirmer)
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        cancelToken: true,
        date: true,
        totalAmount: true,
        client: { select: { firstName: true, email: true } },
        services: {
          select: {
            priceSnapshot: true,
            service: { select: { name: true } },
          },
        },
      },
    });

    if (appt) {
      await sendConfirmationEmail({
        clientFirstName: appt.client.firstName,
        clientEmail: appt.client.email,
        appointmentDate: appt.date,
        services: appt.services.map((s) => ({
          name: s.service.name,
          price: s.priceSnapshot.toFixed(2),
        })),
        totalAmount: appt.totalAmount.toFixed(2),
        cancelToken: appt.cancelToken,
        locale,
      });
    }
  } catch (e) {
    // Non-fatal: webhook will handle it if page-side confirm fails.
    console.error("[confirmBySession] error:", e);
  }
}
