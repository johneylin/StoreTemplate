import { CheckoutClient } from "@/components/checkout-client";
import { db } from "@/lib/db";
import { formatPickupSlotInputValue, formatPickupSlotLabel } from "@/lib/order-display";
import { formatAddress, getPickupAddress } from "@/lib/store-config";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [products, pickupSlots] = await Promise.all([
    db.product.findMany({ orderBy: { createdAt: "desc" } }),
    db.pickupTimeSlot.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
      },
    }),
  ]);
  const pickupAddress = formatAddress(getPickupAddress());

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 pb-20">
      <CheckoutClient
        products={products}
        pickupAddress={pickupAddress}
        pickupSlots={pickupSlots.map((slot) => ({
          id: slot.id,
          label: formatPickupSlotLabel(slot),
          value: formatPickupSlotInputValue(slot),
          endValue: `${slot.endTime.getUTCFullYear()}-${String(slot.endTime.getUTCMonth() + 1).padStart(2, "0")}-${String(slot.endTime.getUTCDate()).padStart(2, "0")}T${String(slot.endTime.getUTCHours()).padStart(2, "0")}:${String(slot.endTime.getUTCMinutes()).padStart(2, "0")}`,
        }))}
      />
    </div>
  );
}
