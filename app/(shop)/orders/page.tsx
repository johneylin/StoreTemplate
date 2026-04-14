import Link from "next/link";
import { requireUser } from "@/lib/auth";
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
import { formatAddress, getPickupAddress } from "@/lib/store-config";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requireUser();
  const orders = await db.order.findMany({
    where: { userId: session.user.id },
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
    orderBy: { createdAt: "desc" },
  });
  const pickupAddress = formatAddress(getPickupAddress());

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 pb-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Order history</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-slate-950">Review every pickup order, payment choice, contact detail, and item subtotal in one place.</h1>
      </div>

      <div className="mt-10 space-y-6">
        {orders.length ? (
          orders.map((order) => (
            <section key={order.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm text-slate-500">Order ID</p>
                  <h2 className="font-display text-2xl font-semibold text-slate-950">{order.orderCode ?? order.id}</h2>
                  <p className="mt-2 text-sm text-slate-500">Placed {formatOrderDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeClass(order.status)}`}>
                    {orderStatusLabels[order.status]}
                  </span>
                  <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
                    {paymentMethodLabels[order.paymentMethod]}
                  </span>
                  <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-900">
                    {fulfillmentMethodLabels[order.fulfillmentMethod]}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">User</p>
                  <p className="mt-2 font-medium text-slate-950">{order.user.name ?? "Customer"}</p>
                  <p className="text-sm text-slate-600">{order.user.email}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup contact</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{formatPickupContact(order)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup time</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{formatPickupTime(order)}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{formatOrderAddress(order, pickupAddress)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Total price</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-950">{formatCurrency(order.total)}</p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
                <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  <span>Order details</span>
                  <span>Unit price</span>
                  <span>Qty</span>
                  <span>Subtotal</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {order.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr] gap-3 px-4 py-4 text-sm text-slate-700">
                      <div>
                        <p className="font-medium text-slate-950">{item.product.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{item.product.category}</p>
                      </div>
                      <p>{formatCurrency(item.unitPrice)}</p>
                      <p>{item.quantity}</p>
                      <p className="font-semibold text-slate-950">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-slate-600">
            You have not placed an order yet. <Link href="/products" className="font-semibold text-slate-950">Browse products</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
