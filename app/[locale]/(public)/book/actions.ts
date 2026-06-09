"use server";

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail } from "@/lib/email";

// ── Shared types ───────────────────────────────────────────────────────────────

export type FormField = {
  id: string;
  type: "text" | "textarea" | "select" | "checkbox" | "date";
  label: string;
  required: boolean;
  options?: string[];
};

export type ServiceOption = {
  id: string;
  name: string;
  description: string | null;
  price: string; // toFixed(2)
  duration: number;
  image: string | null;
  categoryId: string;
  categoryName: string;
  intakeFormId: string | null;
  intakeFormFields: FormField[] | null;
};

export type CategoryWithServices = {
  id: string;
  name: string;
  intakeFormId: string | null;
  intakeFormFields: FormField[] | null;
  services: ServiceOption[];
};

export type ClientInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type BookingDraft = {
  services: ServiceOption[];
  client: ClientInfo;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "HH:MM" 24-hour
  intakeAnswers: Record<string, Record<string, unknown>>; // intakeFormId → { label: value }
};

// ── getCatalog ─────────────────────────────────────────────────────────────────

export async function getCatalog(): Promise<CategoryWithServices[]> {
  const raw = await prisma.serviceCategory.findMany({
    orderBy: { createdAt: "asc" },
    where: { services: { some: { isActive: true } } },
    select: {
      id: true,
      name: true,
      intakeForm: { select: { id: true, fields: true } },
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
          categoryId: true,
        },
      },
    },
  });

  return raw.map((cat) => {
    const intakeFormId = cat.intakeForm?.id ?? null;
    const intakeFormFields = cat.intakeForm
      ? (JSON.parse(JSON.stringify(cat.intakeForm.fields)) as FormField[])
      : null;

    return {
      id: cat.id,
      name: cat.name,
      intakeFormId,
      intakeFormFields,
      services: cat.services.map((svc) => ({
        id: svc.id,
        name: svc.name,
        description: svc.description,
        price: svc.price.toFixed(2),
        duration: svc.duration,
        image: svc.image,
        categoryId: svc.categoryId,
        categoryName: cat.name,
        // propagate category-level intake form to each service
        intakeFormId,
        intakeFormFields,
      })),
    };
  });
}

// ── getAvailableSlots ─────────────────────────────────────────────────────────

const BUSINESS_START_MIN = 9 * 60; // 9:00 AM
const BUSINESS_END_MIN = 18 * 60; // 6:00 PM
const SLOT_INTERVAL = 30;

export async function getAvailableSlots(
  dateStr: string,
  totalDuration: number
): Promise<string[]> {
  const [year, month, day] = dateStr.split("-").map(Number);
  const dayStart = new Date(year, month - 1, day, 0, 0, 0);
  const dayEnd = new Date(year, month - 1, day, 23, 59, 59);

  const booked = await prisma.appointment.findMany({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      status: { not: "CANCELLED" },
    },
    select: {
      date: true,
      services: { select: { service: { select: { duration: true } } } },
    },
  });

  // Booked intervals in minutes since midnight
  const intervals = booked.map((appt) => {
    const start = appt.date.getHours() * 60 + appt.date.getMinutes();
    const dur = appt.services.reduce((s, as) => s + as.service.duration, 0);
    return [start, start + dur] as [number, number];
  });

  const slots: string[] = [];
  for (let t = BUSINESS_START_MIN; t + totalDuration <= BUSINESS_END_MIN; t += SLOT_INTERVAL) {
    const end = t + totalDuration;
    const overlaps = intervals.some(([bs, be]) => t < be && end > bs);
    if (!overlaps) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }

  return slots;
}

// ── createCheckoutSession ─────────────────────────────────────────────────────

type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function createCheckoutSession(
  draft: BookingDraft,
  locale: string
): Promise<CheckoutResult> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const localePrefix = locale === "fr" ? "/fr" : "";

    // Parse appointment date/time
    const [year, month, day] = draft.date.split("-").map(Number);
    const [hour, minute] = draft.timeSlot.split(":").map(Number);
    const appointmentDate = new Date(year, month - 1, day, hour, minute, 0);

    const totalAmount = draft.services.reduce(
      (sum, s) => sum + parseFloat(s.price),
      0
    );

    // Upsert client
    const client = await prisma.client.upsert({
      where: { email: draft.client.email },
      create: {
        firstName: draft.client.firstName,
        lastName: draft.client.lastName,
        email: draft.client.email,
        phone: draft.client.phone || null,
      },
      update: {
        firstName: draft.client.firstName,
        lastName: draft.client.lastName,
        phone: draft.client.phone || null,
      },
    });

    // Create PENDING appointment + services + intake response in a transaction
    const appointment = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.create({
        data: {
          clientId: client.id,
          date: appointmentDate,
          status: "PENDING",
          totalAmount,
          paymentStatus: "UNPAID",
          services: {
            create: draft.services.map((s) => ({
              serviceId: s.id,
              priceSnapshot: parseFloat(s.price),
            })),
          },
        },
        select: { id: true, cancelToken: true },
      });

      // One intake response per appointment — deduplicate by intakeFormId (category-level)
      const seenFormIds = new Set<string>();
      const uniqueFormServices = draft.services.filter((s) => {
        if (!s.intakeFormId || !draft.intakeAnswers[s.intakeFormId]) return false;
        if (seenFormIds.has(s.intakeFormId)) return false;
        seenFormIds.add(s.intakeFormId);
        return true;
      });
      if (uniqueFormServices.length > 0) {
        const combinedResponses: Record<string, unknown> = {};
        for (const svc of uniqueFormServices) {
          Object.assign(combinedResponses, draft.intakeAnswers[svc.intakeFormId!]);
        }
        await tx.intakeFormResponse.create({
          data: {
            appointmentId: appt.id,
            formId: uniqueFormServices[0].intakeFormId!,
            responses: JSON.parse(JSON.stringify(combinedResponses)),
          },
        });
      }

      return appt;
    });

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      draft.services.map((s) => ({
        price_data: {
          currency: "usd",
          product_data: { name: s.name },
          unit_amount: Math.round(parseFloat(s.price) * 100),
        },
        quantity: 1,
      }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        appointmentId: appointment.id,
        cancelToken: appointment.cancelToken,
        locale,
      },
      success_url: `${appUrl}${localePrefix}/booking/confirmation?token=${appointment.cancelToken}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${localePrefix}/book`,
    });

    return { ok: true, url: session.url! };
  } catch (e) {
    console.error("[checkout] createCheckoutSession error:", e);
    return { ok: false, error: "failed" };
  }
}

// ── confirmAppointmentBySession ───────────────────────────────────────────────
// Called from the confirmation page — idempotent via paymentStatus guard.

export type ConfirmResult =
  | {
      ok: true;
      appointment: {
        id: string;
        cancelToken: string;
        date: Date;
        totalAmount: string;
        client: { firstName: string; lastName: string; email: string };
        services: { name: string; price: string }[];
      };
    }
  | { ok: false; error: "not_found" | "not_paid" | "invalid_session" };

export async function confirmAppointmentBySession(
  sessionId: string,
  locale: string
): Promise<ConfirmResult> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { ok: false, error: "not_paid" };
    }

    const appointmentId = session.metadata?.appointmentId;
    if (!appointmentId) return { ok: false, error: "invalid_session" };

    // Idempotent: only update if still UNPAID
    const updated = await prisma.appointment.updateMany({
      where: { id: appointmentId, paymentStatus: "UNPAID" },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
      },
    });

    if (updated.count > 0) {
      // First to confirm: create transaction + send email
      await prisma.transaction.create({
        data: {
          appointmentId,
          amount: (session.amount_total ?? 0) / 100,
          currency: (session.currency ?? "usd").toUpperCase(),
          stripeChargeId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          status: "SUCCEEDED",
        },
      });
    }

    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        cancelToken: true,
        date: true,
        totalAmount: true,
        client: { select: { firstName: true, lastName: true, email: true } },
        services: {
          select: { service: { select: { name: true } }, priceSnapshot: true },
        },
      },
    });

    if (!appt) return { ok: false, error: "not_found" };

    // Send email on first confirm
    if (updated.count > 0) {
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

    return {
      ok: true,
      appointment: {
        id: appt.id,
        cancelToken: appt.cancelToken,
        date: appt.date,
        totalAmount: appt.totalAmount.toFixed(2),
        client: appt.client,
        services: appt.services.map((s) => ({
          name: s.service.name,
          price: s.priceSnapshot.toFixed(2),
        })),
      },
    };
  } catch (e) {
    console.error("[confirm] confirmAppointmentBySession error:", e);
    return { ok: false, error: "invalid_session" };
  }
}

// ── getAppointmentByToken ─────────────────────────────────────────────────────
// Fallback: if user revisits the confirmation page without session_id.

export async function getAppointmentByToken(token: string): Promise<ConfirmResult> {
  const appt = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    select: {
      id: true,
      cancelToken: true,
      date: true,
      totalAmount: true,
      paymentStatus: true,
      client: { select: { firstName: true, lastName: true, email: true } },
      services: {
        select: { service: { select: { name: true } }, priceSnapshot: true },
      },
    },
  });

  if (!appt) return { ok: false, error: "not_found" };
  if (appt.paymentStatus !== "PAID") return { ok: false, error: "not_paid" };

  return {
    ok: true,
    appointment: {
      id: appt.id,
      cancelToken: appt.cancelToken,
      date: appt.date,
      totalAmount: appt.totalAmount.toFixed(2),
      client: appt.client,
      services: appt.services.map((s) => ({
        name: s.service.name,
        price: s.priceSnapshot.toFixed(2),
      })),
    },
  };
}
