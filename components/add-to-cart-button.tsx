"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  productId,
  minimumQuantity = 1,
  disabled = false,
  label,
  className,
  iconOnly = false,
  ariaLabel,
}: {
  productId: string;
  minimumQuantity?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
  iconOnly?: boolean;
  ariaLabel?: string;
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
      aria-label={ariaLabel ?? label ?? (minimumQuantity > 1 ? `Add ${minimumQuantity}+ to cart` : "Add to cart")}
      className={cn(
        "inline-flex min-w-32 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600",
        iconOnly && "min-w-0 rounded-full px-0",
        className,
      )}
    >
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : iconOnly ? (
        <>
          <ShoppingBag className="h-4 w-4 shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] opacity-0 transition-all duration-300 group-hover:max-w-24 group-hover:opacity-100 group-focus-visible:max-w-24 group-focus-visible:opacity-100">
            Add
          </span>
        </>
      ) : null}
      {!iconOnly ? (label ?? (minimumQuantity > 1 ? `Add ${minimumQuantity}+ to cart` : "Add to cart")) : null}
    </button>
  );
}
