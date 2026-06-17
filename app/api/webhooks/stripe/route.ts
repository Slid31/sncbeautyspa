import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail } from "@/lib/email";
import { generateIntakeToken } from "@/app/[locale]/(public)/book/actions";

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
      await handleCheckoutCompleted(session, stripe);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

// ── Handler ───────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  const { appointmentId, locale = "en" } = session.metadata ?? {};
  if (!appointmentId) {
    console.warn("[webhook] checkout.session.completed — no appointmentId in metadata");
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  // ── 1. Idempotent appointment update ──────────────────────────────────────
  const updated = await prisma.appointment.updateMany({
    where: { id: appointmentId, paymentStatus: "UNPAID" },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
    },
  });

  if (updated.count === 0) {
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
    console.warn("[webhook] Transaction already exists — skipping:", e);
  }

  // ── 3. Retrieve card last4 from Stripe ────────────────────────────────────
  let cardLast4: string | undefined;
  if (paymentIntentId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ["latest_charge"],
      });
      if (pi.latest_charge && typeof pi.latest_charge === "object") {
        const charge = pi.latest_charge as Stripe.Charge;
        cardLast4 = charge.payment_method_details?.card?.last4 ?? undefined;
      }
    } catch (e) {
      console.warn("[webhook] Could not retrieve card last4:", e);
    }
  }

  // ── 4. Fetch appointment + transaction ────────────────────────────────────
  const [appt, tx] = await Promise.all([
    prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        cancelToken: true,
        date: true,
        totalAmount: true,
        client: { select: { firstName: true, email: true } },
        services: {
          select: {
            priceSnapshot: true,
            service: { select: { name: true, duration: true } },
          },
        },
      },
    }),
    prisma.transaction.findUnique({ where: { appointmentId } }),
  ]);

  if (!appt) {
    console.error(`[webhook] appointment ${appointmentId} not found after update`);
    return;
  }

  // ── 5. Generate intake token ──────────────────────────────────────────────
  const intakeToken = await generateIntakeToken(appointmentId, appt.date);

  // ── 6. Send combined confirmation + receipt email ─────────────────────────
  await sendConfirmationEmail({
    clientFirstName: appt.client.firstName,
    clientEmail: appt.client.email,
    appointmentDate: appt.date,
    services: appt.services.map((s) => ({
      name: s.service.name,
      duration: s.service.duration,
      price: s.priceSnapshot.toFixed(2),
    })),
    totalAmount: appt.totalAmount.toFixed(2),
    cancelToken: appt.cancelToken,
    intakeFormToken: intakeToken ?? undefined,
    locale,
    transactionId: tx?.id ?? appointmentId,
    paymentDate: tx?.createdAt ?? new Date(),
    cardLast4,
  });
}
