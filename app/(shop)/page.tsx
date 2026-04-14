import Link from "next/link";
import { ArrowRight, Drill, HardHat, PackageCheck, Ruler, Truck } from "lucide-react";
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
      <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-24">
        <div className="overflow-hidden rounded-[2.75rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_28%),linear-gradient(135deg,_#111827_0%,_#1f2937_52%,_#7c2d12_100%)] text-white shadow-2xl shadow-slate-900/20">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">{STORE_NAME} Building Supply</p>
              <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold tracking-tight text-balance md:text-7xl">
                Materials, hardware, and tools ready for fast pickup.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                Stock up on framing lumber, jobsite essentials, anchors, fasteners, and pro-grade tools with a simple pickup checkout flow built for contractors, crews, and home projects.
              </p>
              <p className="mt-4 max-w-xl text-sm font-medium uppercase tracking-[0.28em] text-amber-200">
                {STORE_TAGLINE}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
                  Shop materials
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/orders" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  View order history
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: PackageCheck, label: "Bulk-ready catalog", value: "Lumber, hardware, adhesives" },
                  { icon: Truck, label: "Pickup workflow", value: "Fast local collection windows" },
                  { icon: HardHat, label: "Trade friendly", value: "Guest checkout or account orders" },
                ].map((item) => (
                  <article key={item.label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <item.icon className="h-5 w-5 text-amber-300" />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-white">{item.value}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-rows-[1.1fr_0.9fr]">
              <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-amber-300">
                  <Drill className="h-5 w-5" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Featured yard picks</p>
                </div>
                <div className="mt-6 grid gap-4">
                  {[
                    { name: "Pressure-treated lumber", note: "Deck framing and outdoor repairs" },
                    { name: "Concrete mix & leveling", note: "Foundation patching and post setting" },
                    { name: "Anchors and fasteners", note: "Reliable stock for site callouts" },
                  ].map((item) => (
                    <div key={item.name} className="rounded-[1.5rem] border border-white/10 bg-black/15 px-4 py-4">
                      <p className="font-display text-2xl font-semibold">{item.name}</p>
                      <p className="mt-2 text-sm text-slate-300">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-amber-300/20 bg-amber-50 p-6 text-slate-950">
                <div className="flex items-center gap-3 text-amber-800">
                  <Ruler className="h-5 w-5" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Site order notes</p>
                </div>
                <h2 className="mt-5 font-display text-3xl font-semibold">Built for bundle and pack quantities</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Set minimum order quantities for materials sold by box, bundle, or case, then let customers place pickup orders without back-and-forth quoting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Featured products</p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-slate-950">Top picks for the next build</h2>
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
