import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requireUser();
  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 pb-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Order history</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-slate-950">Track every order placed through the starter storefront.</h1>
      </div>

      <div className="mt-10 space-y-6">
        {orders.length ? (
          orders.map((order) => (
            <section key={order.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm text-slate-500">Order ID</p>
                  <h2 className="font-display text-2xl font-semibold text-slate-950">{order.id}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{order.status}</span>
                  <span className="text-sm font-semibold text-slate-950">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-950">{item.product.name}</p>
                      <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-slate-950">{formatCurrency(item.unitPrice * item.quantity)}</div>
                  </div>
                ))}
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
