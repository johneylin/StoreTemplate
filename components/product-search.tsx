import Link from "next/link";

type ProductSearchProps = {
  query?: string;
  category?: string;
  categories: string[];
};

export function ProductSearch({ query, category, categories }: ProductSearchProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
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
