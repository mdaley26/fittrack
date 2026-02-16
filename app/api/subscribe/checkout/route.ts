import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser, hasActiveSubscription } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const priceId = process.env.STRIPE_PRICE_ID;
let appOrigin = "http://localhost:3000";
try {
  if (process.env.NEXT_PUBLIC_APP_URL) appOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL).origin;
} catch {
  // keep default
}

export async function POST() {
  if (!priceId) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID is not configured" },
      { status: 500 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (hasActiveSubscription(user)) {
    return NextResponse.json(
      { error: "Already subscribed", code: "ALREADY_PRO" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appOrigin}/dashboard?subscribed=1`,
      cancel_url: `${appOrigin}/dashboard?canceled=1`,
      client_reference_id: user.id,
      customer_email: user.email,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
