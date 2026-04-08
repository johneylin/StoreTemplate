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

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 pb-20 lg:grid-cols-[1fr_0.85fr]">
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
        {product.videoUrl ? (
          <video src={product.videoUrl} controls className="h-full w-full object-cover" />
        ) : (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        )}
      </div>

      <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/products" className="text-sm font-semibold text-slate-500 transition hover:text-slate-950">
          Back to products
        </Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">{product.category}</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-slate-950">{product.name}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{product.description}</p>
        <div className="mt-8 flex items-center justify-between gap-4 rounded-[2rem] bg-slate-50 px-5 py-4">
          <div>
            <p className="text-sm text-slate-500">Price</p>
            <p className="font-display text-3xl font-semibold text-slate-950">{formatCurrency(product.price)}</p>
          </div>
          <AddToCartButton productId={product.id} />
        </div>
      </section>
    </div>
  );
}
