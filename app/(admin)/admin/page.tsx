import Image from "next/image";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { BlobUploadField } from "@/components/blob-upload-field";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, slugify } from "@/lib/utils";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().int().positive(),
  minimumOrderQuantity: z.coerce.number().int().positive(),
  imageUrl: z.string().url(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  featured: z.string().optional(),
});

async function upsertProduct(formData: FormData) {
  "use server";

  await requireAdmin();
  const parsed = productSchema.parse(Object.fromEntries(formData));
  const slug = slugify(parsed.name);

  const data = {
    name: parsed.name,
    category: parsed.category,
    description: parsed.description,
    price: parsed.price,
    minimumOrderQuantity: parsed.minimumOrderQuantity,
    imageUrl: parsed.imageUrl,
    videoUrl: parsed.videoUrl || null,
    featured: parsed.featured === "on",
    slug,
  };

  if (parsed.id) {
    await db.product.update({
      where: { id: parsed.id },
      data,
    });
  } else {
    await db.product.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  redirect("/admin");
}

async function removeProduct(formData: FormData) {
  "use server";

  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  await db.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
}

type AdminPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const [products, editableProduct, orderCount] = await Promise.all([
    db.product.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] }),
    params.edit ? db.product.findUnique({ where: { id: params.edit } }) : Promise.resolve(null),
    db.order.count(),
  ]);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 pb-24 xl:grid-cols-[420px_1fr]">
      <section className="h-fit rounded-[2.5rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Admin dashboard</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-slate-950">
              {editableProduct ? `Edit ${editableProduct.name}` : "Create a product"}
            </h1>
          </div>
          {editableProduct ? (
            <Link href="/admin" className="text-sm font-semibold text-slate-500 transition hover:text-slate-950">
              Clear
            </Link>
          ) : null}
        </div>

        <form action={upsertProduct} className="mt-6 space-y-4">
          <input type="hidden" name="id" defaultValue={editableProduct?.id} />
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Name
            <input name="name" defaultValue={editableProduct?.name} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950" />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Category
            <input name="category" defaultValue={editableProduct?.category} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950" />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Price (cents)
            <input name="price" type="number" min="100" step="100" defaultValue={editableProduct?.price ?? 1000} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950" />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Minimum order quantity
            <input
              name="minimumOrderQuantity"
              type="number"
              min="1"
              step="1"
              defaultValue={editableProduct?.minimumOrderQuantity ?? 1}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
            />
          </label>
          <BlobUploadField
            name="imageUrl"
            label="Product image"
            kind="image"
            accept="image/*"
            required
            defaultValue={editableProduct?.imageUrl}
            helperText="Upload an image to Vercel Blob or paste an existing image URL."
          />
          <BlobUploadField
            name="videoUrl"
            label="Product video (optional)"
            kind="video"
            accept="video/*"
            defaultValue={editableProduct?.videoUrl ?? ""}
            helperText="Upload a short promo video to Vercel Blob or paste a hosted video URL."
          />
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Description
            <textarea name="description" rows={5} defaultValue={editableProduct?.description} required className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950" />
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" name="featured" defaultChecked={editableProduct?.featured} className="h-4 w-4 rounded border-slate-300" />
            Feature this product on the home page
          </label>
          <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            {editableProduct ? "Save changes" : "Create product"}
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Inventory</p>
            <p className="mt-3 font-display text-4xl font-semibold">{products.length}</p>
            <p className="mt-2 text-sm text-slate-300">Products ready for the storefront.</p>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Orders</p>
            <p className="mt-3 font-display text-4xl font-semibold">{orderCount}</p>
            <p className="mt-2 text-sm text-slate-300">Customer orders recorded so far.</p>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Operations</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">Need to update fulfillment or payment progress? Review and mark statuses in the order workspace.</p>
            <Link href="/admin/orders" className="mt-4 inline-flex rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
              Manage orders
            </Link>
          </article>
        </div>

        <section className="rounded-[2.5rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Inventory</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-slate-950">Manage products</h2>
            </div>
            <p className="text-sm text-slate-500">{products.length} products</p>
          </div>

          <div className="mt-6 space-y-4">
            {products.map((product) => (
              <article key={product.id} className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">{product.category}</p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-slate-950">{product.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatCurrency(product.price)}{product.featured ? " - Featured" : ""}
                    </p>
                    {product.minimumOrderQuantity > 1 ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Minimum order {product.minimumOrderQuantity}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/admin?edit=${product.id}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">
                    Edit
                  </Link>
                  <form action={removeProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <button className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
