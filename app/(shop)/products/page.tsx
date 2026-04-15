import { ProductCard } from "@/components/product-card";
import { ProductSearch } from "@/components/product-search";
import { getCategories, getProducts } from "@/lib/products";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";

  const [products, categories] = await Promise.all([
    getProducts({ query, category }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 pb-20">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Product catalog</p>
      </div>

      <div className="mt-6">
        <ProductSearch query={query} category={category} categories={categories} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.length ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-slate-600">
            No products matched your current filters.
          </div>
        )}
      </div>
    </div>
  );
}
