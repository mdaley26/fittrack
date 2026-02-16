# Monthly subscription & paywall

This doc describes how subscriptions are modeled and how to finish integrating Stripe and put more features behind the paywall.

## What’s in place

- **Schema**: `User` has `subscriptionStatus`, `stripeCustomerId`, `stripeSubscriptionId`. `subscriptionStatus === "active"` means paid.
- **Auth**: `getCurrentUser()` now returns `subscriptionStatus`. Helpers: `hasActiveSubscription(user)`, `requireSubscription()` for API routes.
- **Example paywall**: `/api/analytics/progress` (exercise progress charts) requires a subscription; returns `402` with `code: "SUBSCRIPTION_REQUIRED"` if not subscribed.

## 1. Stripe setup

1. **Stripe account**  
   Create one at [stripe.com](https://stripe.com) and get API keys (Dashboard → Developers → API keys).

2. **Env vars** (add to `.env`):
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...   # from Stripe CLI or Dashboard → Webhooks
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_PRICE_ID=price_...         # required for checkout
   ```

3. **Products & prices**  
   In Stripe Dashboard create a Product (e.g. “FitTrack Pro”) and a recurring Price (monthly). Set **STRIPE_PRICE_ID** to that Price ID.

## 2. Subscription flow (Stripe Checkout)

- **Subscribe**: send the user to Stripe Checkout with the Price ID (and optional `client_reference_id = user.id`).
- **After payment**: Stripe redirects back to your success URL. You can create the Customer and Subscription on first payment, or create the Customer when the user clicks “Upgrade” and then redirect to Checkout with that `customer` and `customer_email` (or `client_reference_id`).
- **Webhook**: use `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` to keep `User.subscriptionStatus` and `User.stripeSubscriptionId` in sync (set status to `"active"` / `"canceled"` / `"past_due"` etc. from the event).

Example webhook handler (pseudo):

- On `customer.subscription.created` or `updated`: find user by `stripe_customer_id` (or create customer on first event and link by email), then update `subscriptionStatus` from `subscription.status` and save `stripeSubscriptionId`.
- On `customer.subscription.deleted`: set `subscriptionStatus = "canceled"` (or `null` for “free”).

Use **Stripe CLI** for local webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## 3. Putting more features behind the paywall

### API (backend)

Use `requireSubscription()` in any route that should be premium-only:

```ts
import { requireSubscription } from "@/lib/auth";

export async function GET() {
  const result = await requireSubscription();
  if ("response" in result) return result.response;
  const { user } = result;
  // ... premium logic
}
```

Return type: if not logged in → `401`; if logged in but not subscribed → `402` with `{ error: "Subscription required", code: "SUBSCRIPTION_REQUIRED" }`. Your frontend can show an “Upgrade” CTA when it gets `402`.

### UI (frontend)

- **User context**: `/api/auth/me` now includes `user.subscriptionStatus`. Use it in your app (e.g. React context or SWR) so components know `hasActiveSubscription`.
- **Conditional UI**:
  - If subscribed: render the feature (e.g. progress charts, templates, etc.).
  - If not subscribed: render a locked state + “Upgrade to Pro” button that links to your Stripe Checkout or pricing page.
- **Premium routes**: for a whole page (e.g. `/analytics`) you can:
  - Redirect to a “Upgrade” page if `!hasActiveSubscription(user)`, or
  - Render the page but show a paywall overlay for premium sections (and use `requireSubscription()` in the APIs so data isn’t returned for free users).

### Optional: middleware for premium paths

You can protect paths like `/analytics` in `middleware.ts` by:

1. Reading the JWT (you already have the cookie).
2. Calling an edge-compatible way to get subscription status (e.g. a small API or JWT that includes `subscriptionStatus`).

If you don’t want to decode JWT in middleware, you can instead enforce everything in the page + API: page shows paywall, API returns 402 for premium endpoints.

## 4. Summary

| Layer        | Action |
|-------------|--------|
| **Database** | `User.subscriptionStatus` (and Stripe IDs) already in schema. Run `npx prisma db push` or create a migration. |
| **Stripe**   | Add keys, create Product/Price, implement Checkout redirect and webhook that updates `User`. |
| **API**      | Use `requireSubscription()` in any premium route (see progress route example). |
| **UI**       | Use `user.subscriptionStatus` from `/api/auth/me`; show upgrade CTA or lock UI when not subscribed. |

Once the webhook and Checkout flow are implemented, any new feature can be put behind the paywall by gating its API with `requireSubscription()` and its UI with `subscriptionStatus === "active"`.
