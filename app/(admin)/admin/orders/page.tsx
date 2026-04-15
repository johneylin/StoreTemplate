import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatOrderAddress,
  formatOrderDate,
  formatPickupContact,
  formatPickupTime,
  fulfillmentMethodLabels,
  getStatusBadgeClass,
  orderStatusLabels,
  orderStatusOptions,
  paymentMethodLabels,
} from "@/lib/order-display";
import { formatAddress, getPickupAddress } from "@/lib/store-config";
import { formatCurrency } from "@/lib/utils";
import { updateOrderStatus } from "./actions";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    status?: string;
    payment?: string;
    search?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const returnToParams = new URLSearchParams();
  if (params.status) {
    returnToParams.set("status", params.status);
  }
  if (params.payment) {
    returnToParams.set("payment", params.payment);
  }
  if (params.search) {
    returnToParams.set("search", params.search);
  }
  const returnTo = returnToParams.size ? `/admin/orders?${returnToParams.toString()}` : "/admin/orders";
  const pickupAddress = formatAddress(getPickupAddress());
  const statusFilter = orderStatusOptions.includes(params.status as (typeof orderStatusOptions)[number])
    ? (params.status as (typeof orderStatusOptions)[number])
    : "ALL";
  const paymentFilter = params.payment === "E_TRANSFER" || params.payment === "CASH" ? params.payment : "ALL";
  const search = params.search?.trim() ?? "";

  const orders = await db.order.findMany({
    where: {
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      ...(paymentFilter !== "ALL" ? { paymentMethod: paymentFilter } : {}),
      ...(search
        ? {
            OR: [
              { orderCode: { contains: search, mode: "insensitive" } },
              { pickupEmail: { contains: search, mode: "insensitive" } },
              { pickupPhone: { contains: search, mode: "insensitive" } },
              { user: { is: { email: { contains: search, mode: "insensitive" } } } },
              { user: { is: { name: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 pb-24">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">Order workspace</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">Review customer history, filter active orders, and update fulfillment status.</h1>
      </div>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-slate-950/20">
        <form className="grid gap-4 md:grid-cols-[1.2fr_0.7fr_0.7fr_auto]">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Search order, email, or phone
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Order ID, email, or phone"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Status
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
            >
              <option value="ALL">All statuses</option>
              {orderStatusOptions.map((status) => (
                <option key={status} value={status}>{orderStatusLabels[status]}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Payment
            <select
              name="payment"
              defaultValue={paymentFilter}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
            >
              <option value="ALL">All payments</option>
              <option value="E_TRANSFER">{paymentMethodLabels.E_TRANSFER}</option>
              <option value="CASH">{paymentMethodLabels.CASH}</option>
            </select>
          </label>
          <div className="flex items-end gap-3">
            <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Apply filters
            </button>
          </div>
        </form>
      </section>

      <div className="mt-10 space-y-6">
        {orders.map((order) => (
          <section key={order.id} className="rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-slate-950/20">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm text-slate-500">Order ID</p>
                <h2 className="font-display text-2xl font-semibold text-slate-950">{order.orderCode ?? order.id}</h2>
                <p className="mt-2 text-sm text-slate-500">Placed {formatOrderDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
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

            <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">User</p>
                <p className="mt-2 font-medium text-slate-950">{order.user?.name ?? "Guest checkout"}</p>
                <p className="text-sm text-slate-600">{order.user?.email ?? order.pickupEmail ?? "No account email"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup contact</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{formatPickupContact(order)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup time</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{formatPickupTime(order)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup address</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{formatOrderAddress(order, pickupAddress)}</p>
                <p className="mt-3 font-display text-3xl font-semibold text-slate-950">{formatCurrency(order.total)}</p>
              </div>
              <form action={updateOrderStatus} className="rounded-2xl bg-slate-50 p-4 xl:min-w-56">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Mark status</p>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <select key={`${order.id}-${order.status}`} name="status" defaultValue={order.status} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950">
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status}>{orderStatusLabels[status]}</option>
                  ))}
                </select>
                <button type="submit" className="mt-3 w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Save status
                </button>
              </form>
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
        ))}

        {!orders.length ? (
          <div className="rounded-[2rem] border border-dashed border-white/20 bg-white/5 p-10 text-slate-300">
            No orders matched the current filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
