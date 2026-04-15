import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/generated/prisma/client";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const isComingSoon = product.availability === "COMING_SOON";
  const isOutOfStock = product.stockQuantity <= 0;
  const canBuy = !isComingSoon && !isOutOfStock;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-900">
            {product.category}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${isComingSoon ? "bg-slate-200 text-slate-700" : isOutOfStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800"}`}>
            {isComingSoon ? "Coming soon" : isOutOfStock ? "Out of stock" : `In stock ${product.stockQuantity}`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-lg font-semibold text-slate-900">{formatCurrency(product.price)}</span>
        </div>
        <div className="space-y-2">
          <Link href={`/products/${product.slug}`} className="font-display text-xl font-semibold text-slate-950">
            {product.name}
          </Link>
          <p className="line-clamp-3 text-sm leading-6 text-slate-600">{product.description}</p>
          {product.minimumOrderQuantity > 1 ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Minimum order {product.minimumOrderQuantity}
            </p>
          ) : null}
        </div>
        <div className="flex gap-3">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            View details
          </Link>
          <AddToCartButton
            productId={product.id}
            minimumQuantity={product.minimumOrderQuantity}
            disabled={!canBuy}
            label={isComingSoon ? "Coming soon" : isOutOfStock ? "Out of stock" : undefined}
          />
        </div>
      </div>
    </article>
  );
}
