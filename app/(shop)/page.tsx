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
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 pb-8 sm:px-6 sm:pt-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_24%),linear-gradient(140deg,_#0f172a_0%,_#1e293b_58%,_#78350f_100%)] text-white shadow-xl shadow-slate-900/15 sm:rounded-[2.75rem]">
          <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300 sm:text-sm">{STORE_NAME} Building Supply</p>
              <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-6xl">
                Pickup-ready materials and hardware for the next job.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
                Shop lumber, anchors, mixes, fasteners, and site essentials with simple quantity-based ordering and quick local pickup scheduling.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
                  Shop materials
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/orders" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  View order history
                </Link>
              </div>
              <p className="mt-5 max-w-xl text-xs font-medium uppercase tracking-[0.24em] text-amber-200 sm:text-sm sm:tracking-[0.28em]">
                {STORE_TAGLINE}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { icon: PackageCheck, label: "Bulk-ready stock", value: "Materials, hardware, and adhesives for trade orders." },
                { icon: Truck, label: "Simple pickup flow", value: "Choose an available pickup window right at checkout." },
                { icon: HardHat, label: "Built for site work", value: "Guest orders or account history for repeat buyers." },
              ].map((item) => (
                <article key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                  <item.icon className="h-5 w-5 text-amber-300" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-white">{item.value}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 text-amber-800">
              <Drill className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">Featured yard picks</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {[
                { name: "Pressure-treated lumber", note: "Deck framing and exterior repairs" },
                { name: "Concrete mix", note: "Footings, posts, and patch work" },
                { name: "Anchors and fasteners", note: "Reliable stock for site callouts" },
              ].map((item) => (
                <div key={item.name} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="font-display text-xl font-semibold text-slate-950">{item.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-amber-300/30 bg-amber-50 p-5 text-slate-950 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 text-amber-800">
              <Ruler className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">Site order notes</p>
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">Built for bundle and pack quantities</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Set minimum order quantities for materials sold by box, bundle, or case, then let customers place pickup orders without back-and-forth quoting.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Featured products</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-950 sm:text-4xl">Top picks for the next build</h2>
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
