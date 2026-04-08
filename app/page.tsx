import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getCategories, getFeaturedProducts } from "@/lib/products";

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
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Modern retail starter</p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold tracking-tight text-balance md:text-7xl">
            Launch a premium storefront with auth, admin, and checkout built in.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Northstar Commerce gives you a polished shopping experience, product management for admins, order history for customers, and a Stripe checkout flow wired to a PostgreSQL database.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
              Browse products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Open admin dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            {
              icon: ShoppingBag,
              title: "Catalog + Cart",
              description: "Searchable product listing, detail pages, cart quantity updates, and a focused checkout flow.",
            },
            {
              icon: ShieldCheck,
              title: "Auth + Orders",
              description: "Credential login, protected order history, and admin-only management tools.",
            },
            {
              icon: Sparkles,
              title: "Real starter stack",
              description: "Next.js App Router, Tailwind CSS, Prisma, PostgreSQL, and Stripe in one clean repo.",
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
