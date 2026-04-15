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
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-slate-950">Find the products your customers are already looking for.</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">Search by keyword, narrow by category, and browse a seeded catalog backed by Prisma and PostgreSQL.</p>
      </div>

      <div className="mt-8">
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
