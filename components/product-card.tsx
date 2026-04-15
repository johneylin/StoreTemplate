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
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/products/${product.slug}`}
        aria-label={`View details for ${product.name}`}
        className="absolute inset-0 z-10"
      />
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <span className="rounded-full bg-amber-100/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-900 shadow-sm">
            {product.category}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] shadow-sm ${isComingSoon ? "bg-slate-100/95 text-slate-700" : isOutOfStock ? "bg-rose-100/95 text-rose-700" : "bg-emerald-100/95 text-emerald-800"}`}>
            {isComingSoon ? "Coming soon" : isOutOfStock ? "Out of stock" : `In stock ${product.stockQuantity}`}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
          <AddToCartButton
            productId={product.id}
            minimumQuantity={product.minimumOrderQuantity}
            disabled={!canBuy}
            iconOnly
            ariaLabel={isComingSoon ? "Coming soon" : isOutOfStock ? "Out of stock" : `Add ${product.name} to cart`}
            className={`h-11 w-11 border border-white/60 bg-white/95 text-slate-950 shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 hover:bg-amber-300 active:scale-95 disabled:border-slate-200 disabled:bg-white/80 disabled:text-slate-500 ${
              canBuy ? "animate-in fade-in zoom-in-95" : ""
            }`}
          />
        </div>
      </div>
      <div className="pointer-events-none relative z-20 space-y-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="line-clamp-2 font-display text-lg font-semibold leading-6 text-slate-950 sm:text-xl">
            {product.name}
          </p>
          <span className="shrink-0 text-base font-semibold text-slate-900 sm:text-lg">{formatCurrency(product.price)}</span>
        </div>
        <div className="space-y-1.5">
          {product.minimumOrderQuantity > 1 ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Minimum order {product.minimumOrderQuantity}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
