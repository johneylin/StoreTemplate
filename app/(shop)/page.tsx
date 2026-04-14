import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getCategories, getFeaturedProducts } from "@/lib/products";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div className="pb-20">
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.3fr_0.7fr] lg:py-24">
        <div className="rounded-[2.5rem] border border-white/40 bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-slate-900/20 lg:px-12 lg:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">{STORE_NAME}</p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold tracking-tight text-balance md:text-7xl">
            A polished pickup-first storefront with login, cart, guest checkout, and admin tools already in place.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            {STORE_NAME} gives customers a warm, premium shopping experience with searchable products, protected order history, and a checkout flow built around pickup windows and manual payments.
          </p>
          <p className="mt-4 max-w-xl text-sm font-medium uppercase tracking-[0.28em] text-amber-200">
            {STORE_TAGLINE}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
              Browse products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/orders" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              View order history
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            {
              icon: ShoppingBag,
              title: "Catalog + Cart",
              description: "Searchable product listing, detail pages, cart quantity updates, and a focused pickup checkout flow.",
            },
            {
              icon: ShieldCheck,
              title: "Account + Orders",
              description: "Credential login, protected order history, guest checkout support, and clear order summaries.",
            },
            {
              icon: Sparkles,
              title: "Manual payments",
              description: "Accept e-transfer or cash orders while keeping pickup details and order status organized in PostgreSQL.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <item.icon className="h-6 w-6 text-amber-700" />
              <h2 className="mt-4 font-display text-2xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Featured products</p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-slate-950">Start with a curated collection</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link key={category} href={`/products?category=${encodeURIComponent(category)}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950">
                {category}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
