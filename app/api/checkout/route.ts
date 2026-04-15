import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createGuestDeviceId, getGuestDeviceCookieOptions, GUEST_DEVICE_COOKIE } from "@/lib/guest-device";
import { generateUniqueOrderCode } from "@/lib/order-code";
import { sendOrderNotifications } from "@/lib/order-notifications";
import { formatPickupSlotLabel, formatSelectedPickupDateTime, isPickupDateTimeWithinSlot } from "@/lib/order-display";
import { formatAddress, getETransferEmail, getPickupAddress } from "@/lib/store-config";

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
  pickupDateTime: z.string().trim().min(1, "Please choose one of the available pickup times."),
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
  const cookieStore = await cookies();
  const existingGuestDeviceId = cookieStore.get(GUEST_DEVICE_COOKIE)?.value ?? null;
  const guestDeviceId = session?.user?.id ? null : (existingGuestDeviceId ?? createGuestDeviceId());

  const payload = payloadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Your order payload is invalid." }, { status: 400 });
  }

  const [products, pickupSlots] = await Promise.all([
    db.product.findMany({
      where: {
        id: { in: payload.data.items.map((item) => item.productId) },
      },
    }),
    db.pickupTimeSlot.findMany({
      where: { active: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
  ]);

  const pickupTimeSlot = pickupSlots.find(
    (slot) => isPickupDateTimeWithinSlot(payload.data.pickupDateTime, slot),
  );

  if (!pickupTimeSlot) {
    return NextResponse.json({ error: "The selected date and time is not in the available pickup schedule. Please choose one of the available times." }, { status: 400 });
  }

  const lineItems = payload.data.items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) {
        return null;
      }

      if (product.availability === "COMING_SOON") {
        return {
          product,
          quantity: item.quantity,
          invalid: "coming_soon" as const,
        };
      }

      if (item.quantity < product.minimumOrderQuantity) {
        return {
          product,
          quantity: item.quantity,
          invalid: "minimum" as const,
        };
      }

      if (item.quantity > product.stockQuantity) {
        return {
          product,
          quantity: item.quantity,
          invalid: "stock" as const,
        };
      }

      return {
        product,
        quantity: item.quantity,
        invalid: null,
      };
    })
    .filter(Boolean) as { product: (typeof products)[number]; quantity: number; invalid: "coming_soon" | "minimum" | "stock" | null }[];

  if (!lineItems.length) {
    return NextResponse.json({ error: "No valid products were found for checkout." }, { status: 400 });
  }

  const invalidMinimum = lineItems.find((item) => item.invalid);
  if (invalidMinimum?.invalid === "coming_soon") {
    return NextResponse.json({
      error: `${invalidMinimum.product.name} is coming soon and cannot be ordered yet.`,
    }, { status: 400 });
  }

  if (invalidMinimum?.invalid === "minimum") {
    return NextResponse.json({
      error: `${invalidMinimum.product.name} requires a minimum order of ${invalidMinimum.product.minimumOrderQuantity}.`,
    }, { status: 400 });
  }

  if (invalidMinimum?.invalid === "stock") {
    return NextResponse.json({
      error: `${invalidMinimum.product.name} only has ${invalidMinimum.product.stockQuantity} in stock right now.`,
    }, { status: 400 });
  }

  const total = lineItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const pickupAddress = formatAddress(getPickupAddress());
  const eTransferEmail = getETransferEmail();
  const orderCode = await generateUniqueOrderCode(async (code) => {
    const existing = await db.order.findUnique({
      where: { orderCode: code },
      select: { id: true },
    });
    return Boolean(existing);
  });

  try {
    const order = await db.$transaction(async (tx) => {
      for (const item of lineItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.product.id,
            availability: "ACTIVE",
            stockQuantity: {
              gte: item.quantity,
            },
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error(`${item.product.name} is no longer available in the requested quantity.`);
        }
      }

      return tx.order.create({
        data: {
          orderCode,
          userId: session?.user?.id ?? null,
          guestDeviceId,
          paymentMethod: payload.data.paymentMethod,
          fulfillmentMethod: "PICKUP",
          pickupPhone: payload.data.pickupPhone?.trim() || null,
          pickupEmail: payload.data.pickupEmail?.trim() || null,
          pickupTimeLabel: `${formatSelectedPickupDateTime(payload.data.pickupDateTime)} within ${formatPickupSlotLabel(pickupTimeSlot)}`,
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
    });

    const resolvedOrderId = order.orderCode ?? order.id;
    await sendOrderNotifications({
      orderId: resolvedOrderId,
      paymentMethod: order.paymentMethod,
      pickupPhone: order.pickupPhone,
      pickupEmail: order.pickupEmail,
      pickupTime: order.pickupTimeLabel ?? `${formatSelectedPickupDateTime(payload.data.pickupDateTime)} within ${formatPickupSlotLabel(pickupTimeSlot)}`,
      pickupAddress,
      eTransferEmail,
    });

    const response = NextResponse.json({ orderId: resolvedOrderId });

    if (guestDeviceId) {
      response.cookies.set(GUEST_DEVICE_COOKIE, guestDeviceId, getGuestDeviceCookieOptions());
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to place order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
