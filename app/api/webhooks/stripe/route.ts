import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail } from "@/lib/email";

// Stripe requires the raw body for webhook signature verification.
// App Router gives us req.text() which is correct — no bodyParser override needed.

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

// ── Handler ───────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { appointmentId, locale = "en" } = session.metadata ?? {};
  if (!appointmentId) {
    console.warn("[webhook] checkout.session.completed — no appointmentId in metadata");
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  // ── 1. Idempotent appointment update ──────────────────────────────────────
  // Only runs when paymentStatus is still UNPAID; concurrent calls are safe.
  const updated = await prisma.appointment.updateMany({
    where: { id: appointmentId, paymentStatus: "UNPAID" },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
    },
  });

  if (updated.count === 0) {
    // Already processed by the confirmation page or a prior webhook delivery.
    console.log(`[webhook] appointment ${appointmentId} already confirmed — skipping`);
    return;
  }

  console.log(`[webhook] appointment ${appointmentId} confirmed (locale: ${locale})`);

  // ── 2. Create Transaction record ──────────────────────────────────────────
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
  } catch (e) {
    // Unique constraint: Transaction already created by confirmation-page fallback.
    console.warn("[webhook] Transaction already exists — skipping:", e);
  }

  // ── 3. Send confirmation email in the client's locale ─────────────────────
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

  if (!appt) {
    console.error(`[webhook] appointment ${appointmentId} not found after update`);
    return;
  }

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
