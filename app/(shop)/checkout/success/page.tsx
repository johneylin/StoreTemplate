import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatOrderAddress,
  formatOrderDate,
  formatPickupContact,
  formatPickupTime,
  fulfillmentMethodLabels,
  getStatusBadgeClass,
  orderStatusLabels,
  paymentMethodLabels,
} from "@/lib/order-display";
import { formatAddress, getETransferEmail, getPickupAddress } from "@/lib/store-config";
import { formatCurrency } from "@/lib/utils";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    order_id?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const session = await getSession();
  const { order_id: orderId } = await searchParams;
  const pickupAddress = formatAddress(getPickupAddress());
  const eTransferEmail = getETransferEmail();

  if (!orderId) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16 pb-24">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 text-slate-700 shadow-sm md:p-10">
          <h1 className="font-display text-4xl font-semibold text-slate-950">No order selected</h1>
          <p className="mt-4 text-lg leading-8">Return to the storefront and place an order to see your pickup confirmation.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Browse products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestOrder = await db.order.findFirst({
    where: session?.user?.id
      ? {
          orderCode: orderId,
          OR: [
            { userId: session.user.id },
            { userId: null },
          ],
        }
      : {
          orderCode: orderId,
          userId: null,
        },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const paymentInstructions = {
    E_TRANSFER: `Send your e-transfer to ${eTransferEmail} and include your order ID in the message.`,
    CASH: "Please bring cash when you arrive for pickup. We will confirm your selected pickup time separately if needed.",
  } as const;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 pb-24">
      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Order received</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-slate-950">Thanks for your order.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Your pickup order has been recorded with manual payment details. Use the instructions below to complete payment and arrive during your selected pickup window.
        </p>

        {latestOrder ? (
          <div className="mt-10 rounded-[2rem] bg-slate-50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Order ID</p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <p className="font-display text-2xl font-semibold text-slate-950">{latestOrder.orderCode ?? latestOrder.id}</p>
                  <CopyButton value={latestOrder.orderCode ?? latestOrder.id} label="Copy order ID" />
                </div>
                <p className="mt-2 text-sm text-slate-500">Placed {formatOrderDate(latestOrder.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeClass(latestOrder.status)}`}>
                  {orderStatusLabels[latestOrder.status]}
                </span>
                <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
                  {paymentMethodLabels[latestOrder.paymentMethod]}
                </span>
                <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-900">
                  {fulfillmentMethodLabels[latestOrder.fulfillmentMethod]}
                </span>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950">
                {latestOrder.paymentMethod === "E_TRANSFER" ? (
                  <div>
                    <p>Send your e-transfer to <span className="font-semibold">{eTransferEmail}</span> and include your order ID in the message.</p>
                    <div className="mt-3">
                      <CopyButton value={eTransferEmail} label="Copy transfer email" className="border-amber-300 bg-white/70 text-amber-950 hover:border-amber-700 hover:text-amber-950" />
                    </div>
                  </div>
                ) : (
                  paymentInstructions[latestOrder.paymentMethod]
                )}
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-950">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-800">Pickup time</p>
                <p className="mt-2">{formatPickupTime(latestOrder)}</p>
                <p className="mt-3">{formatOrderAddress(latestOrder, pickupAddress)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup contact</p>
                <p className="mt-2">{formatPickupContact(latestOrder)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Customer</p>
                <p className="mt-2 font-medium text-slate-950">{latestOrder.user?.name ?? "Guest checkout"}</p>
                <p>{latestOrder.user?.email ?? latestOrder.pickupEmail ?? "No account email"}</p>
                <p className="mt-3 font-display text-2xl font-semibold text-slate-950">{formatCurrency(latestOrder.total)}</p>
              </div>
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
        ) : (
          <div className="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-700">
            We could not find that order confirmation.
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {session?.user ? (
            <Link href="/orders" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              View order history
            </Link>
          ) : null}
          <Link href="/products" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
