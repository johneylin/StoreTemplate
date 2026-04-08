import { db } from "@/lib/db";

export type ProductFilters = {
  query?: string;
  category?: string;
};

export async function getCategories() {
  const categories = await db.product.findMany({
    distinct: ["category"],
    orderBy: { category: "asc" },
    select: { category: true },
  });

  return categories.map((item) => item.category);
}

export async function getProducts(filters: ProductFilters = {}) {
  const { query, category } = filters;

  return db.product.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export async function getFeaturedProducts() {
  return db.product.findMany({
    where: { featured: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
  });
}
