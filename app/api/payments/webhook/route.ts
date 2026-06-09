// Redirected to the canonical webhook handler at /api/webhooks/stripe.
// Configure your Stripe dashboard to send events to /api/webhooks/stripe instead.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Please use /api/webhooks/stripe for Stripe webhook events." },
    { status: 410 }
  );
}
