import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
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

async function seedUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  await prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      passwordHash,
      role: input.role,
    },
    create: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
  });
}

async function seedProduct(product: {
  name: string;
  category: string;
  price: number;
  featured: boolean;
  imageUrl: string;
  description: string;
}) {
  const slug = slugify(product.name);

  await prisma.product.upsert({
    where: { slug },
    update: {
      ...product,
      slug,
    },
    create: {
      ...product,
      slug,
    },
  });
}

async function seedPickupSlot(slot: {
  date: Date;
  startTime: Date;
  endTime: Date;
  active: boolean;
}) {
  const existing = await prisma.pickupTimeSlot.findFirst({
    where: {
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.pickupTimeSlot.update({
      where: { id: existing.id },
      data: { active: slot.active },
    });
    return;
  }

  await prisma.pickupTimeSlot.create({ data: slot });
}

async function main() {
  const adminName = getRequiredEnv("ADMIN_NAME");
  const adminEmail = getRequiredEnv("ADMIN_EMAIL");
  const adminPassword = getRequiredEnv("ADMIN_PASSWORD");
  const shopperName = process.env.SHOPPER_NAME?.trim() || "Sample Shopper";
  const shopperEmail = process.env.SHOPPER_EMAIL?.trim() || "shopper@example.com";
  const shopperPassword = process.env.SHOPPER_PASSWORD?.trim() || "Shopper123!";

  await seedUser({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: Role.ADMIN,
  });

  await seedUser({
    name: shopperName,
    email: shopperEmail,
    password: shopperPassword,
    role: Role.USER,
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

  for (const product of products) {
    await seedProduct(product);
  }

  const pickupSlots = [
    createSlot("2026-04-15", "10:00", "12:00"),
    createSlot("2026-04-15", "14:00", "16:00"),
    createSlot("2026-04-16", "16:00", "18:00"),
  ];

  for (const slot of pickupSlots) {
    await seedPickupSlot(slot);
  }
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
