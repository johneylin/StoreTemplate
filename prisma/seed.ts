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
  minimumOrderQuantity: number;
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
      name: "2x4 Pressure-Treated Lumber",
      category: "Building Materials",
      price: 1299,
      minimumOrderQuantity: 8,
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1513467655676-561b7d489a88?auto=format&fit=crop&w=1200&q=80",
      description: "Ground-contact pressure-treated framing lumber sized for decks, fence runs, and general outdoor structural work.",
    },
    {
      name: "Galvanized Framing Anchor Pack",
      category: "Hardware",
      price: 2199,
      minimumOrderQuantity: 4,
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1581147036324-c1c9d4f0f8a0?auto=format&fit=crop&w=1200&q=80",
      description: "Corrosion-resistant framing anchors for joists, trusses, and reinforcement points on indoor and outdoor builds.",
    },
    {
      name: "Contractor Concrete Mix 30kg",
      category: "Building Materials",
      price: 899,
      minimumOrderQuantity: 10,
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1597983073540-7d1d1f0d88f1?auto=format&fit=crop&w=1200&q=80",
      description: "General-purpose concrete blend for pads, footings, fence posts, and repair jobs that need dependable strength on site.",
    },
    {
      name: "Impact Driver Bit Set",
      category: "Tools",
      price: 3499,
      minimumOrderQuantity: 1,
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
      description: "Shock-resistant impact-rated bit assortment for fastening crews, cabinet installs, and jobsite tool bags.",
    },
    {
      name: "Construction Adhesive Case",
      category: "Hardware",
      price: 1599,
      minimumOrderQuantity: 12,
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22731d8a08?auto=format&fit=crop&w=1200&q=80",
      description: "Heavy-duty adhesive tubes sold by the case for framing, panel installs, and repeated site use.",
    },
    {
      name: "Diamond Cutting Wheel 7in",
      category: "Tools",
      price: 2799,
      minimumOrderQuantity: 2,
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1200&q=80",
      description: "Long-life cutting wheel for masonry, concrete, and tile work where clean cuts and steady performance matter.",
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
