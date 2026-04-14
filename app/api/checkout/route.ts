import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateUniqueOrderCode } from "@/lib/order-code";
import { formatPickupSlotLabel } from "@/lib/order-display";

const payloadSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
  paymentMethod: z.enum(["E_TRANSFER", "CASH"]),
  pickupPhone: z.string().trim().optional(),
  pickupEmail: z.string().trim().optional(),
  pickupTimeSlotId: z.string().trim().min(1),
}).superRefine((value, ctx) => {
  if (!value.pickupPhone && !value.pickupEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pickupPhone"],
      message: "Enter a phone number or email address for pickup.",
    });
  }

  if (value.pickupEmail && !z.email().safeParse(value.pickupEmail).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pickupEmail"],
      message: "Enter a valid email address.",
    });
  }
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  const payload = payloadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Your order payload is invalid." }, { status: 400 });
  }

  const [products, pickupTimeSlot] = await Promise.all([
    db.product.findMany({
      where: {
        id: { in: payload.data.items.map((item) => item.productId) },
      },
    }),
    db.pickupTimeSlot.findFirst({
      where: {
        id: payload.data.pickupTimeSlotId,
        active: true,
      },
    }),
  ]);

  if (!pickupTimeSlot) {
    return NextResponse.json({ error: "The selected pickup time is no longer available." }, { status: 400 });
  }

  const lineItems = payload.data.items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) {
        return null;
      }

      return {
        product,
        quantity: item.quantity,
      };
    })
    .filter(Boolean) as { product: (typeof products)[number]; quantity: number }[];

  if (!lineItems.length) {
    return NextResponse.json({ error: "No valid products were found for checkout." }, { status: 400 });
  }

  const total = lineItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const orderCode = await generateUniqueOrderCode(async (code) => {
    const existing = await db.order.findUnique({
      where: { orderCode: code },
      select: { id: true },
    });
    return Boolean(existing);
  });

  const order = await db.order.create({
    data: {
      orderCode,
      userId: session?.user?.id ?? null,
      paymentMethod: payload.data.paymentMethod,
      fulfillmentMethod: "PICKUP",
      pickupPhone: payload.data.pickupPhone?.trim() || null,
      pickupEmail: payload.data.pickupEmail?.trim() || null,
      pickupTimeLabel: formatPickupSlotLabel(pickupTimeSlot),
      pickupTimeSlotId: pickupTimeSlot.id,
      total,
      shippingStreet: null,
      shippingCity: null,
      shippingState: null,
      shippingPostCode: null,
      items: {
        create: lineItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
      },
    },
  });

  return NextResponse.json({ orderId: order.orderCode ?? order.id });
}
