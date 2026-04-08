import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { formatCurrency } from "@/lib/utils";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const session = await requireUser();
  const { session_id: sessionId } = await searchParams;

  if (sessionId) {
    try {
      const stripe = getStripe();
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
      if (checkoutSession.payment_status === "paid") {
        await db.order.updateMany({
          where: {
            stripeCheckoutSessionId: sessionId,
            userId: session.user.id,
          },
          data: {
            status: "PAID",
          },
        });
      }
    } catch {
      // Keep the page renderable even when Stripe is not configured.
    }
  }

  const latestOrder = await db.order.findFirst({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 pb-24">
      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Order received</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-slate-950">Thanks for your purchase.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Your order has been recorded. If Stripe was configured with a working test key, paid sessions are marked automatically on this page.</p>

        {latestOrder ? (
          <div className="mt-10 rounded-[2rem] bg-slate-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Latest order</p>
                <p className="font-display text-2xl font-semibold text-slate-950">{latestOrder.id}</p>
              </div>
              <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                {latestOrder.status}
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {latestOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-950">{item.product.name}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-slate-950">{formatCurrency(item.unitPrice * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/orders" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            View order history
          </Link>
          <Link href="/products" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
