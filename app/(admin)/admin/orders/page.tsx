import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatOrderAddress,
  formatOrderDate,
  formatPickupContact,
  formatPickupSlotLabel,
  formatPickupTime,
  fulfillmentMethodLabels,
  getStatusBadgeClass,
  orderStatusLabels,
  orderStatusOptions,
  paymentMethodLabels,
} from "@/lib/order-display";
import { formatAddress, getPickupAddress } from "@/lib/store-config";
import { formatCurrency } from "@/lib/utils";

const statusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(orderStatusOptions),
});

const pickupSlotSchema = z.object({
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
}).superRefine((value, ctx) => {
  const start = new Date(`${value.date}T${value.startTime}:00`);
  const end = new Date(`${value.date}T${value.endTime}:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["date"],
      message: "Enter a valid pickup date and time range.",
    });
    return;
  }

  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "Pickup end time must be after the start time.",
    });
  }
});

const pickupSlotToggleSchema = z.object({
  slotId: z.string().min(1),
  nextActive: z.enum(["true", "false"]),
});

async function updateOrderStatus(formData: FormData) {
  "use server";

  await requireAdmin();
  const parsed = statusSchema.parse(Object.fromEntries(formData));

  await db.order.update({
    where: { id: parsed.orderId },
    data: { status: parsed.status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  revalidatePath("/checkout/success");
}

async function createPickupSlot(formData: FormData) {
  "use server";

  await requireAdmin();
  const parsed = pickupSlotSchema.parse(Object.fromEntries(formData));
  const start = new Date(`${parsed.date}T${parsed.startTime}:00`);
  const end = new Date(`${parsed.date}T${parsed.endTime}:00`);
  const date = new Date(`${parsed.date}T00:00:00`);

  await db.pickupTimeSlot.create({
    data: {
      date,
      startTime: start,
      endTime: end,
      active: true,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/checkout");
}

async function togglePickupSlot(formData: FormData) {
  "use server";

  await requireAdmin();
  const parsed = pickupSlotToggleSchema.parse(Object.fromEntries(formData));

  await db.pickupTimeSlot.update({
    where: { id: parsed.slotId },
    data: { active: parsed.nextActive === "true" },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/checkout");
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const pickupAddress = formatAddress(getPickupAddress());
  const [orders, pickupSlots] = await Promise.all([
    db.order.findMany({
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
    }),
    db.pickupTimeSlot.findMany({
      orderBy: [{ active: "desc" }, { date: "asc" }, { startTime: "asc" }],
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 pb-24">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">Order workspace</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">Review customer history, control pickup availability, and mark payment progress.</h1>
      </div>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-slate-950/20">
        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Pickup time management</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-slate-950">Set available pickup dates and times</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Create actual pickup windows customers can select during checkout. Disable any slot when it should no longer appear.
            </p>
            <form action={createPickupSlot} className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
                Pickup date
                <input
                  type="date"
                  name="date"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Start time
                <input
                  type="time"
                  name="startTime"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                End time
                <input
                  type="time"
                  name="endTime"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                />
              </label>
              <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:col-span-2">
                Add pickup window
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {pickupSlots.length ? (
              pickupSlots.map((slot) => (
                <article key={slot.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-slate-950">{formatPickupSlotLabel(slot)}</p>
                    <p className="mt-1 text-sm text-slate-500">{slot.active ? "Visible in checkout" : "Hidden from checkout"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${slot.active ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-700"}`}>
                      {slot.active ? "Active" : "Inactive"}
                    </span>
                    <form action={togglePickupSlot}>
                      <input type="hidden" name="slotId" value={slot.id} />
                      <input type="hidden" name="nextActive" value={slot.active ? "false" : "true"} />
                      <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">
                        {slot.active ? "Disable" : "Enable"}
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600">
                No pickup windows yet. Add one so customers can complete checkout.
              </div>
            )}
          </div>
        </div>
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
                <select name="status" defaultValue={order.status} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950">
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status}>{orderStatusLabels[status]}</option>
                  ))}
                </select>
                <button className="mt-3 w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
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
            No orders have been placed yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
