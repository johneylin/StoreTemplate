"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPickupDate, createPickupDateTime, orderStatusOptions } from "@/lib/order-display";

const statusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(orderStatusOptions),
});

const pickupSlotSchema = z.object({
  slotId: z.string().optional(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
}).superRefine((value, ctx) => {
  const start = createPickupDateTime(value.date, value.startTime);
  const end = createPickupDateTime(value.date, value.endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["date"],
      message: "Enter a valid pickup date and time range.",
    });
    return;
  }

  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "Pickup end time must be after the start time.",
    });
  }
});

const pickupSlotCopySchema = z.object({
  slotId: z.string().min(1),
});

const pickupSlotDeleteSchema = z.object({
  slotId: z.string().min(1),
});

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const parsed = statusSchema.parse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });
  const returnTo = typeof formData.get("returnTo") === "string" && formData.get("returnTo")
    ? String(formData.get("returnTo"))
    : "/admin/orders";

  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: parsed.orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return;
    }

    if (order.status === parsed.status) {
      return;
    }

    if (order.status !== "CANCELED" && parsed.status === "CANCELED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    if (order.status === "CANCELED" && parsed.status !== "CANCELED") {
      for (const item of order.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
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
          throw new Error("One or more items no longer have enough stock to restore this order from canceled status.");
        }
      }
    }

    await tx.order.update({
      where: { id: parsed.orderId },
      data: { status: parsed.status },
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  revalidatePath("/checkout/success");
  redirect(returnTo);
}

export async function createPickupSlot(formData: FormData) {
  await requireAdmin();
  const parsed = pickupSlotSchema.parse({
    slotId: formData.get("slotId") || undefined,
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });
  const start = createPickupDateTime(parsed.date, parsed.startTime);
  const end = createPickupDateTime(parsed.date, parsed.endTime);
  const date = createPickupDate(parsed.date);

  if (parsed.slotId) {
    await db.pickupTimeSlot.update({
      where: { id: parsed.slotId },
      data: {
        active: true,
        date,
        startTime: start,
        endTime: end,
      },
    });
  } else {
    await db.pickupTimeSlot.create({
      data: {
        date,
        startTime: start,
        endTime: end,
        active: true,
      },
    });
  }

  revalidatePath("/admin/pickup");
  revalidatePath("/checkout");
}

export async function copyPickupSlotToNextWeek(formData: FormData) {
  await requireAdmin();
  const parsed = pickupSlotCopySchema.parse({
    slotId: formData.get("slotId"),
  });
  const slot = await db.pickupTimeSlot.findUnique({
    where: { id: parsed.slotId },
  });

  if (!slot) {
    return;
  }

  const nextDate = new Date(slot.date);
  nextDate.setUTCDate(nextDate.getUTCDate() + 7);

  const nextStart = new Date(slot.startTime);
  nextStart.setUTCDate(nextStart.getUTCDate() + 7);

  const nextEnd = new Date(slot.endTime);
  nextEnd.setUTCDate(nextEnd.getUTCDate() + 7);

  await db.pickupTimeSlot.create({
    data: {
      date: nextDate,
      startTime: nextStart,
      endTime: nextEnd,
      active: true,
    },
  });

  revalidatePath("/admin/pickup");
  revalidatePath("/checkout");
}

export async function deletePickupSlot(formData: FormData) {
  await requireAdmin();
  const parsed = pickupSlotDeleteSchema.parse({
    slotId: formData.get("slotId"),
  });

  await db.pickupTimeSlot.delete({
    where: { id: parsed.slotId },
  });

  revalidatePath("/admin/pickup");
  revalidatePath("/checkout");
}
