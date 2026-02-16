import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  // #region agent log — confirm request reaches handler (check Vercel logs); if missing, 307 is before this
  console.log("[Stripe webhook] POST received", { url: req.url, hasSignature: !!req.headers.get("stripe-signature") });
  // #endregion
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const status = subscription.status;

        // Map Stripe status to our DB; only "active" and "trialing" get Pro access
        const subscriptionStatus =
          status === "active" || status === "trialing"
            ? "active"
            : status === "paused" || status === "past_due" || status === "canceled" || status === "unpaid"
              ? status
              : status;

        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;
        const email = customer.email;
        if (!email) break;

        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscription.id,
              subscriptionStatus,
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { subscriptionStatus: "canceled", stripeSubscriptionId: null },
        });
        break;
      }
      default:
        // Unhandled event type
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
