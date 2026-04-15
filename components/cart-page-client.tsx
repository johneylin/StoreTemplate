"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/generated/prisma/client";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/utils";

type CartPageClientProps = {
  products: Product[];
};

export function CartPageClient({ products }: CartPageClientProps) {
  const { items, removeItem, updateQuantity } = useCart();
  const blockedNumberKeys = ["e", "E", "+", "-", "."];

  const lineItems = items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) {
        return null;
      }

      return {
        product,
        quantity: item.quantity,
      };
    })
    .filter(Boolean) as { product: Product; quantity: number }[];

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const cartIssues = lineItems.flatMap(({ product, quantity }) => {
    if (product.availability === "COMING_SOON") {
      return [`${product.name} is coming soon and cannot be purchased yet.`];
    }

    if (product.stockQuantity <= 0) {
      return [`${product.name} is out of stock.`];
    }

    if (quantity > product.stockQuantity) {
      return [`${product.name} only has ${product.stockQuantity} in stock, but your cart has ${quantity}.`];
    }

    return [];
  });
  const hasCartIssues = cartIssues.length > 0;

  if (!lineItems.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h2 className="font-display text-3xl font-semibold text-slate-950">Your cart is empty.</h2>
        <p className="mt-3 text-slate-600">Browse the catalog and add a few products to get started.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
      <div className="space-y-4">
        {hasCartIssues ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {cartIssues.map((issue) => (
              <p key={issue}>{issue}</p>
            ))}
          </div>
        ) : null}
        {lineItems.map(({ product, quantity }) => (
          <article key={product.id} className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-2xl object-cover"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">{product.category}</p>
                <Link href={`/products/${product.slug}`} className="mt-1 block font-display text-xl font-semibold text-slate-950">
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-slate-500">{formatCurrency(product.price)} each</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {product.availability === "COMING_SOON" ? "Coming soon" : `In stock ${product.stockQuantity}`}
                </p>
                {product.minimumOrderQuantity > 1 ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Minimum order {product.minimumOrderQuantity}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-slate-200 px-2 py-1">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1, product.minimumOrderQuantity)}
                  disabled={quantity <= product.minimumOrderQuantity}
                  className="h-9 w-9 rounded-full text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={product.minimumOrderQuantity}
                  max={product.stockQuantity}
                  step={1}
                  value={quantity}
                  onChange={(event) => {
                    const nextValue = Number.parseInt(event.target.value, 10);
                    if (Number.isNaN(nextValue)) {
                      return;
                    }

                    updateQuantity(product.id, nextValue, product.minimumOrderQuantity);
                  }}
                  onKeyDown={(event) => {
                    if (blockedNumberKeys.includes(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  className="w-12 bg-transparent text-center text-sm font-semibold text-slate-950 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  aria-label={`Quantity for ${product.name}`}
                />
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity + 1, product.minimumOrderQuantity)}
                  disabled={product.availability === "COMING_SOON" || quantity >= product.stockQuantity}
                  className="h-9 w-9 rounded-full text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  +
                </button>
              </div>
              <span className="min-w-24 text-right text-sm font-semibold text-slate-950">
                {formatCurrency(product.price * quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-slate-950">Order summary</h2>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-950">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span className="font-semibold text-slate-950">Free</span>
          </div>
        </div>
        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between text-base font-semibold text-slate-950">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            aria-disabled={hasCartIssues}
            className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
              hasCartIssues
                ? "pointer-events-none bg-slate-200 text-slate-500"
                : "bg-amber-400 text-slate-950 hover:bg-amber-300"
            }`}
          >
            Proceed to checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
