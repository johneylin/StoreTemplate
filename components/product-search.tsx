import Link from "next/link";

type ProductSearchProps = {
  query?: string;
  category?: string;
  categories: string[];
};

export function ProductSearch({ query, category, categories }: ProductSearchProps) {
  const renderForm = (mobile = false) => (
    <form className={`grid gap-4 ${mobile ? "" : "md:grid-cols-[1fr_220px_auto]"}`}>
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search products"
        className="rounded-full border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-950"
      />
      <select
        name="category"
        defaultValue={category ?? ""}
        className="rounded-full border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950"
      >
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
        Apply filters
      </button>
    </form>
  );

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <details className="rounded-[1.5rem] border border-slate-200 bg-stone-50 md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-950">
          Filter products
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Tap to expand</span>
        </summary>
        <div className="border-t border-slate-200 px-4 py-4">
          {renderForm(true)}
        </div>
      </details>

      <div className="hidden md:block">{renderForm()}</div>

      {(query || category) ? (
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
          <span>Filtering active</span>
          <Link href="/products" className="font-semibold text-slate-950">
            Clear all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
