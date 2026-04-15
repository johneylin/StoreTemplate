import { formatAddress } from "@/lib/store-config";

export const paymentMethodLabels = {
  E_TRANSFER: "E-transfer",
  CASH: "Cash",
} as const;

export const fulfillmentMethodLabels = {
  PICKUP: "Pick up at address",
  SHIP: "Ship to address",
} as const;

export const orderStatusLabels = {
  PENDING: "Pending",
  PAID: "Paid",
  FULFILLED: "Fulfilled",
  CANCELED: "Canceled",
} as const;

export const orderStatusOptions = ["PENDING", "PAID", "FULFILLED", "CANCELED"] as const;

export function formatShippingAddress(order: {
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostCode: string | null;
}) {
  if (!order.shippingStreet || !order.shippingCity || !order.shippingState || !order.shippingPostCode) {
    return null;
  }

  return formatAddress({
    street: order.shippingStreet,
    city: order.shippingCity,
    state: order.shippingState,
    postCode: order.shippingPostCode,
  });
}

export function formatOrderAddress(
  order: {
    fulfillmentMethod: "PICKUP" | "SHIP";
    shippingStreet: string | null;
    shippingCity: string | null;
    shippingState: string | null;
    shippingPostCode: string | null;
  },
  pickupAddress: string,
) {
  if (order.fulfillmentMethod === "SHIP") {
    return formatShippingAddress(order) ?? "Shipping address unavailable";
  }

  return pickupAddress;
}

export function formatPickupContact(order: {
  pickupPhone: string | null;
  pickupEmail: string | null;
}) {
  if (order.pickupPhone && order.pickupEmail) {
    return `${order.pickupPhone} / ${order.pickupEmail}`;
  }

  return order.pickupPhone ?? order.pickupEmail ?? "No pickup contact provided";
}

export function formatPickupSlotRange(startTime: Date, endTime: Date) {
  return `${new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(startTime)} - ${new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(endTime)}`;
}

export function formatPickupSlotLabel(slot: {
  date: Date;
  startTime: Date;
  endTime: Date;
}) {
  const dateLabel = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(slot.date);

  return `${dateLabel} ${formatPickupSlotRange(slot.startTime, slot.endTime)}`;
}

export function formatPickupTime(order: {
  pickupTimeLabel: string | null;
}) {
  return order.pickupTimeLabel ?? "Pickup time not selected";
}

export function formatOrderDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function getStatusBadgeClass(status: keyof typeof orderStatusLabels) {
  switch (status) {
    case "PAID":
      return "bg-amber-100 text-amber-900";
    case "FULFILLED":
      return "bg-emerald-100 text-emerald-900";
    case "CANCELED":
      return "bg-rose-100 text-rose-900";
    default:
      return "bg-slate-200 text-slate-800";
  }
}
