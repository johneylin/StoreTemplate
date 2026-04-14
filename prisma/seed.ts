import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createSlot(date: string, startTime: string, endTime: string) {
  return {
    date: new Date(`${date}T00:00:00`),
    startTime: new Date(`${date}T${startTime}:00`),
    endTime: new Date(`${date}T${endTime}:00`),
    active: true,
  };
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.pickupTimeSlot.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Admin123!", 10);
  const shopperPasswordHash = await bcrypt.hash("Shopper123!", 10);

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: "Sample Shopper",
      email: "shopper@example.com",
      passwordHash: shopperPasswordHash,
      role: Role.USER,
    },
  });

  const products = [
    {
      name: "Atlas Trail Jacket",
      category: "Outerwear",
      price: 18900,
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
      description: "Weather-ready shell with a refined technical silhouette for city commutes and weekend escapes.",
    },
    {
      name: "Nocturne Leather Tote",
      category: "Accessories",
      price: 24000,
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      description: "Structured premium tote with interior laptop sleeve and polished hardware details.",
    },
    {
      name: "Studio Knit Set",
      category: "Apparel",
      price: 12500,
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
      description: "Soft matching set designed for effortless styling, travel days, and elevated loungewear.",
    },
    {
      name: "Sierra Weekender",
      category: "Travel",
      price: 31000,
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
      description: "Carry-on friendly duffel with waterproof lining, shoe compartment, and premium canvas shell.",
    },
    {
      name: "Luma Desk Lamp",
      category: "Home",
      price: 9800,
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
      description: "Minimal task lighting with warm dimmable LEDs and a sculptural anodized finish.",
    },
    {
      name: "Pulse Runner",
      category: "Footwear",
      price: 14900,
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      description: "Everyday performance sneaker with responsive cushioning and lightweight knit support.",
    },
  ];

  await prisma.product.createMany({
    data: products.map((product) => ({
      ...product,
      slug: slugify(product.name),
    })),
  });

  await prisma.pickupTimeSlot.createMany({
    data: [
      createSlot("2026-04-15", "10:00", "12:00"),
      createSlot("2026-04-15", "14:00", "16:00"),
      createSlot("2026-04-16", "16:00", "18:00"),
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
