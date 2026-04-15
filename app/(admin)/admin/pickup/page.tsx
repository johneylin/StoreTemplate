import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatPickupDateInputValue,
  formatPickupSlotLabel,
  formatPickupTimeInputValue,
} from "@/lib/order-display";
import { copyPickupSlotToNextWeek, createPickupSlot, deletePickupSlot } from "../orders/actions";

type AdminPickupPageProps = {
  searchParams: Promise<{ slot?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminPickupPage({ searchParams }: AdminPickupPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const [pickupSlots, editableSlot] = await Promise.all([
    db.pickupTimeSlot.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    params.slot ? db.pickupTimeSlot.findUnique({ where: { id: params.slot } }) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 pb-24">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">Pickup workspace</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">Set available pickup dates and times without leaving the admin workspace.</h1>
      </div>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-slate-950/20">
        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Pickup time management</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-slate-950">Set available pickup dates and times</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Create pickup windows customers can select during checkout. Edit an existing slot or copy it to the same time next week.
            </p>
            {editableSlot ? (
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span>Editing {formatPickupSlotLabel(editableSlot)}</span>
                <Link href="/admin/pickup" className="font-semibold text-slate-950">
                  Clear
                </Link>
              </div>
            ) : null}
            <form action={createPickupSlot} className="mt-6 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="slotId" value={editableSlot?.id ?? ""} />
              <label className="block space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
                Pickup date
                <input
                  type="date"
                  name="date"
                  defaultValue={editableSlot ? formatPickupDateInputValue(editableSlot.date) : ""}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Start time
                <input
                  type="time"
                  name="startTime"
                  defaultValue={editableSlot ? formatPickupTimeInputValue(editableSlot.startTime) : ""}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                End time
                <input
                  type="time"
                  name="endTime"
                  defaultValue={editableSlot ? formatPickupTimeInputValue(editableSlot.endTime) : ""}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                />
              </label>
              <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:col-span-2">
                {editableSlot ? "Save pickup window" : "Add pickup window"}
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {pickupSlots.length ? (
              pickupSlots.map((slot) => (
                <article key={slot.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-slate-950">{formatPickupSlotLabel(slot)}</p>
                    <p className="mt-1 text-sm text-slate-500">Available in checkout</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/pickup?slot=${slot.id}`}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                    >
                      Edit
                    </Link>
                    <form action={copyPickupSlotToNextWeek}>
                      <input type="hidden" name="slotId" value={slot.id} />
                      <button type="submit" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">
                        Copy to next week
                      </button>
                    </form>
                    <form action={deletePickupSlot}>
                      <input type="hidden" name="slotId" value={slot.id} />
                      <button type="submit" className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                        Delete
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
    </div>
  );
}
