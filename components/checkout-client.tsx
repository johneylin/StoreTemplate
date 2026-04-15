"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { PaymentMethod, Product } from "@/generated/prisma/client";
import { useCart } from "@/components/cart-provider";
import { isPickupDateTimeWithinSlot } from "@/lib/order-display";
import { formatCurrency } from "@/lib/utils";

type PickupSlot = {
  id: string;
  label: string;
  value: string;
  endValue: string;
};

type CheckoutClientProps = {
  products: Product[];
  pickupAddress: string;
  pickupSlots: PickupSlot[];
};

const paymentLabels: Record<PaymentMethod, string> = {
  E_TRANSFER: "E-transfer",
  CASH: "Cash",
};

export function CheckoutClient({ products, pickupAddress, pickupSlots }: CheckoutClientProps) {
  const { items, clearCart } = useCart();
  const { data: session, status } = useSession();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("E_TRANSFER");
  const [pickupPhone, setPickupPhone] = useState("");
  const [pickupEmail, setPickupEmail] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const hasMatchingPickupTime = pickupSlots.some((slot) =>
    isPickupDateTimeWithinSlot(pickupDateTime, {
      startTime: new Date(`${slot.value}:00.000Z`),
      endTime: new Date(`${slot.endValue}:00.000Z`),
    }),
  );
  const pickupTimeIssue =
    pickupDateTime && !hasMatchingPickupTime
      ? "The pickup time you entered is not in the available schedule. Enter one of the available times shown above."
      : null;

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
  const hasPickupContact = Boolean(pickupPhone.trim() || pickupEmail.trim());
  const stockIssues = lineItems.flatMap(({ product, quantity }) => {
    if (product.availability === "COMING_SOON") {
      return [`${product.name} is coming soon and cannot be ordered yet.`];
    }

    if (product.stockQuantity <= 0) {
      return [`${product.name} is out of stock.`];
    }

    if (quantity > product.stockQuantity) {
      return [`${product.name} only has ${product.stockQuantity} in stock, but your cart has ${quantity}.`];
    }

    return [];
  });
  const hasStockIssues = stockIssues.length > 0;

  useEffect(() => {
    if (!pickupEmail && session?.user?.email) {
      setPickupEmail(session.user.email);
    }
  }, [pickupEmail, session?.user?.email]);

  async function handleCheckout() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod,
          pickupPhone,
          pickupEmail,
          pickupDateTime,
        }),
      });

      const payload = (await response.json()) as { orderId?: string; error?: string };
      if (!response.ok || !payload.orderId) {
        throw new Error(payload.error ?? "Unable to place order.");
      }

      clearCart();
      window.location.href = `/checkout/success?order_id=${payload.orderId}`;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to place order.");
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
        <h1 className="mt-3 font-display text-4xl font-semibold text-slate-950">Complete your pickup order</h1>
        <p className="mt-3 text-slate-600">
          {session?.user
            ? `Signed in as ${session.user.email}`
            : "Guest checkout is enabled. You can place an order without logging in."}
        </p>

        <div className="mt-8 space-y-4">
          {hasStockIssues ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700">
              {stockIssues.map((issue) => (
                <p key={issue}>{issue}</p>
              ))}
            </div>
          ) : null}
          {lineItems.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="font-medium text-slate-950">{product.name}</p>
                <p className="text-sm text-slate-500">Qty {quantity}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {product.availability === "COMING_SOON" ? "Coming soon" : `In stock ${product.stockQuantity}`}
                </p>
                {product.minimumOrderQuantity > 1 ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Minimum order {product.minimumOrderQuantity}
                  </p>
                ) : null}
              </div>
              <p className="font-semibold text-slate-950">{formatCurrency(product.price * quantity)}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-slate-950">Pickup details</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Orders are pickup only. Choose your pickup time and leave a phone number or email address so we can reach you if needed.
        </p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          Pickup address: <span className="font-semibold text-slate-950">{pickupAddress}</span>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-slate-700">
          Available pickup times:
          <div className="mt-2 space-y-1">
            {pickupSlots.length ? (
              pickupSlots.map((slot) => (
                <p key={slot.id} className="font-medium text-slate-950">{slot.label}</p>
              ))
            ) : (
              <p className="font-medium text-rose-700">No pickup times are available right now.</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Phone number
            <input
              type="tel"
              value={pickupPhone}
              onChange={(event) => setPickupPhone(event.target.value)}
              placeholder="416-555-0123"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              value={pickupEmail}
              onChange={(event) => setPickupEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
            Enter pickup date and time
            <input
              type="datetime-local"
              value={pickupDateTime}
              onChange={(event) => setPickupDateTime(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
            />
            <p className="text-xs leading-5 text-slate-500">
              Enter one of the available pickup times exactly as listed above.
            </p>
            {pickupTimeIssue ? <p className="text-sm font-medium text-rose-600">{pickupTimeIssue}</p> : null}
          </label>
        </div>

        {!pickupSlots.length ? (
          <p className="mt-4 text-sm font-medium text-rose-600">No pickup times are available right now. Please check back after the admin adds a pickup slot.</p>
        ) : null}

        <h2 className="mt-8 font-display text-2xl font-semibold text-slate-950">Payment method</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This store accepts manual payments only. Choose e-transfer or cash, then place the order to receive the payment instructions.
        </p>
        <div className="mt-6 space-y-3">
          {(["E_TRANSFER", "CASH"] as PaymentMethod[]).map((method) => (
            <label key={method} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-slate-950">
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block font-semibold text-slate-950">{paymentLabels[method]}</span>
                <span className="mt-1 block text-sm text-slate-500">
                  {method === "E_TRANSFER"
                    ? "Place the order first, then send your e-transfer using the instructions on the confirmation page."
                    : "Place the order now and bring cash when you arrive for pickup."}
                </span>
              </span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-y border-slate-200 py-4 text-sm">
          <span className="text-slate-500">Total</span>
          <span className="text-lg font-semibold text-slate-950">{formatCurrency(total)}</span>
        </div>
        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
        <button
          type="button"
          disabled={pending || !pickupSlots.length || !pickupDateTime || !hasMatchingPickupTime || !hasPickupContact || hasStockIssues}
          onClick={handleCheckout}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Placing order..." : `Place order with ${paymentLabels[paymentMethod]}`}
        </button>
      </aside>
    </div>
  );
}
