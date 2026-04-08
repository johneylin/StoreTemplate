import { CheckoutClient } from "@/components/checkout-client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 pb-20">
      <CheckoutClient products={products} />
    </div>
  );
}
