import { formatAddress } from "@/lib/store-config";

function padPickupPart(value: number) {
  return value.toString().padStart(2, "0");
}

function formatPickupTimeValue(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function createPickupDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function createPickupDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}

export function createPickupDateTimeFromInput(value: string) {
  const [date, time] = value.split("T");
  if (!date || !time) {
    return null;
  }

  return createPickupDateTime(date, time);
}

export function formatPickupDateInputValue(date: Date) {
  return `${date.getUTCFullYear()}-${padPickupPart(date.getUTCMonth() + 1)}-${padPickupPart(date.getUTCDate())}`;
}

export function formatPickupTimeInputValue(date: Date) {
  return `${padPickupPart(date.getUTCHours())}:${padPickupPart(date.getUTCMinutes())}`;
}

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
  return `${formatPickupTimeValue(startTime)} - ${formatPickupTimeValue(endTime)}`;
}

export function formatPickupSlotInputValue(slot: {
  startTime: Date;
}) {
  return `${formatPickupDateInputValue(slot.startTime)}T${formatPickupTimeInputValue(slot.startTime)}`;
}

export function isPickupDateTimeWithinSlot(value: string, slot: {
  startTime: Date;
  endTime: Date;
}) {
  const selectedTime = createPickupDateTimeFromInput(value);

  if (!selectedTime) {
    return false;
  }

  return selectedTime >= slot.startTime && selectedTime <= slot.endTime;
}

export function formatPickupSlotLabel(slot: {
  date: Date;
  startTime: Date;
  endTime: Date;
}) {
  const dateLabel = new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(slot.date);

  return `${dateLabel} ${formatPickupSlotRange(slot.startTime, slot.endTime)}`;
}

export function formatSelectedPickupDateTime(value: string) {
  const selectedTime = createPickupDateTimeFromInput(value);
  if (!selectedTime) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(selectedTime);
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
