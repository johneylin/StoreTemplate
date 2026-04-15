import { CartPageClient } from "@/components/cart-page-client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 pb-20">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Shopping cart</p>
        <h1 className="mt-3 font-display text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Review your items before checkout.</h1>
      </div>
      <CartPageClient products={products} />
    </div>
  );
}
