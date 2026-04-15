import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { getProductBySlug } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isComingSoon = product.availability === "COMING_SOON";
  const isOutOfStock = product.stockQuantity <= 0;
  const canBuy = !isComingSoon && !isOutOfStock;

  return (
    <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-6 overflow-x-clip px-4 py-6 pb-16 sm:gap-10 sm:px-6 sm:py-10 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:py-12">
      <div className="relative min-w-0 aspect-[4/3] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm sm:rounded-[2.5rem] lg:aspect-auto lg:min-h-[620px]">
        {product.videoUrl ? (
          <video src={product.videoUrl} controls className="h-full w-full object-cover" />
        ) : (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        )}
      </div>

      <section className="min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2.5rem] sm:p-8">
        <Link href="/products" className="text-sm font-semibold text-slate-500 transition hover:text-slate-950">
          Back to products
        </Link>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 sm:mt-6 sm:text-sm sm:tracking-[0.28em]">
          {product.category}
        </p>
        <h1 className="mt-3 break-words font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
          {product.name}
        </h1>
        <p className="mt-4 break-words text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">{product.description}</p>
        <div className="mt-6 flex min-w-0 flex-col gap-4 rounded-[1.75rem] bg-slate-50 px-4 py-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:rounded-[2rem] sm:px-5">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Price</p>
            <p className="font-display text-2xl font-semibold text-slate-950 sm:text-3xl">{formatCurrency(product.price)}</p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-700">
              {isComingSoon ? "Coming soon" : isOutOfStock ? "Out of stock" : `In stock: ${product.stockQuantity}`}
            </p>
            {product.minimumOrderQuantity > 1 ? (
              <p className="mt-2 break-words text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Minimum order {product.minimumOrderQuantity}
              </p>
            ) : null}
          </div>
          <AddToCartButton
            productId={product.id}
            minimumQuantity={product.minimumOrderQuantity}
            disabled={!canBuy}
            label={isComingSoon ? "Coming soon" : isOutOfStock ? "Out of stock" : undefined}
            className="w-full sm:w-auto"
          />
        </div>
      </section>
    </div>
  );
}
