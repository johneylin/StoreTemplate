"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { Product } from "@/generated/prisma/client";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/utils";

type CheckoutClientProps = {
  products: Product[];
};

export function CheckoutClient({ products }: CheckoutClientProps) {
  const { items, clearCart } = useCart();
  const { data: session, status } = useSession();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lineItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { product, quantity: item.quantity } : null;
        })
        .filter(Boolean) as { product: Product; quantity: number }[],
    [items, products],
  );

  const total = lineItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function handleCheckout() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Unable to start checkout.");
      }

      clearCart();
      window.location.href = payload.url;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start checkout.");
      setPending(false);
    }
  }

  if (!lineItems.length) {
    return <p className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-slate-600">Your cart is empty.</p>;
  }

  if (status === "loading") {
    return <p className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-600">Checking your session...</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Checkout</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-slate-950">Complete your purchase</h1>
        <p className="mt-3 text-slate-600">
          {session?.user
            ? `Signed in as ${session.user.email}`
            : "Please sign in before starting checkout."}
        </p>

        <div className="mt-8 space-y-4">
          {lineItems.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="font-medium text-slate-950">{product.name}</p>
                <p className="text-sm text-slate-500">Qty {quantity}</p>
              </div>
              <p className="font-semibold text-slate-950">{formatCurrency(product.price * quantity)}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-slate-950">Payment</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This starter uses Stripe Checkout. Add your real Stripe test key in `.env` to complete a hosted test payment.
        </p>
        <div className="mt-6 flex items-center justify-between border-y border-slate-200 py-4 text-sm">
          <span className="text-slate-500">Total</span>
          <span className="text-lg font-semibold text-slate-950">{formatCurrency(total)}</span>
        </div>
        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
        <button
          type="button"
          disabled={!session?.user || pending}
          onClick={handleCheckout}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Redirecting..." : session?.user ? "Pay with Stripe" : "Login required"}
        </button>
      </aside>
    </div>
  );
}
