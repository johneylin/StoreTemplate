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
        <div className="pointer-events-none absolute left-2 top-2 z-20 sm:left-4 sm:top-4">
          <span className="rounded-full bg-amber-100/95 px-2 py-0.5 text-[0.48rem] font-semibold uppercase tracking-[0.16em] text-amber-900 shadow-sm sm:px-2.5 sm:py-0.5 sm:text-[0.62rem]">
            {product.category}
          </span>
        </div>
        <div className="pointer-events-none absolute right-2 top-2 z-20 sm:right-4 sm:top-4">
          <span className={`inline-flex max-w-[5.75rem] rounded-full px-2 py-0.5 text-center text-[0.48rem] font-semibold uppercase tracking-[0.12em] shadow-sm sm:max-w-[7.5rem] sm:px-2.5 sm:py-0.5 sm:text-[0.62rem] ${isComingSoon ? "bg-slate-100/95 text-slate-700" : isOutOfStock ? "bg-rose-100/95 text-rose-700" : "bg-emerald-100/95 text-emerald-800"}`}>
            {isComingSoon ? "Coming soon" : isOutOfStock ? "Out of stock" : `In stock ${product.stockQuantity}`}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 z-30 pointer-events-auto sm:bottom-4 sm:right-4">
          <AddToCartButton
            productId={product.id}
            minimumQuantity={product.minimumOrderQuantity}
            disabled={!canBuy}
            iconOnly
            quickAdd
            ariaLabel={isComingSoon ? "Coming soon" : isOutOfStock ? "Out of stock" : `Add ${product.name} to cart`}
            className={`group h-7 w-7 border border-white/70 bg-white/95 p-0 text-slate-950 shadow-lg shadow-slate-950/15 transition duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-white/95 focus-visible:scale-105 focus-visible:bg-white/95 active:scale-95 sm:h-9 sm:w-9 ${
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
