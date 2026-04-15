"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export function AddToCartButton({
  productId,
  minimumQuantity = 1,
  disabled = false,
  label,
}: {
  productId: string;
  minimumQuantity?: number;
  disabled?: boolean;
  label?: string;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) {
          return;
        }
        setPending(true);
        addItem(productId, minimumQuantity);
        router.refresh();
        setTimeout(() => setPending(false), 250);
      }}
      disabled={disabled}
      className="inline-flex min-w-32 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {label ?? (minimumQuantity > 1 ? `Add ${minimumQuantity}+ to cart` : "Add to cart")}
    </button>
  );
}
