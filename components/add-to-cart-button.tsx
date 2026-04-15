"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Plus, ShoppingBag } from "lucide-react";
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
  quickAdd = false,
}: {
  productId: string;
  minimumQuantity?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
  iconOnly?: boolean;
  ariaLabel?: string;
  quickAdd?: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) {
          return;
        }
        setPending(true);
        setAdded(false);
        addItem(productId, minimumQuantity);
        router.refresh();
        setTimeout(() => {
          setPending(false);
          setAdded(true);
          setTimeout(() => setAdded(false), 900);
        }, 250);
      }}
      disabled={disabled}
      aria-label={ariaLabel ?? label ?? (minimumQuantity > 1 ? `Add ${minimumQuantity}+ to cart` : "Add to cart")}
      className={cn(
        "inline-flex min-w-32 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600",
        iconOnly && "min-w-0 rounded-full px-0",
        className,
      )}
    >
      {pending && quickAdd ? (
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden">
          <LoaderCircle className="h-4 w-4 animate-spin" />
        </span>
      ) : added && quickAdd ? (
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden">
          <span className="absolute inset-0 rounded-full border border-current/25 animate-in zoom-in-95" />
          <span className="absolute inset-0 rounded-full border border-current/15 animate-ping" />
          <Check className="relative z-10 h-4 w-4 animate-in zoom-in-95" />
        </span>
      ) : iconOnly && quickAdd ? (
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden">
          <span className="absolute inset-0 rounded-full bg-white/90 transition duration-300 group-hover:bg-amber-200 group-focus-visible:bg-amber-200" />
          <span className="relative z-10 flex items-center justify-center text-slate-950 transition duration-300 group-hover:scale-105 group-focus-visible:scale-105">
            <span className="relative inline-flex">
              <ShoppingBag className="h-4 w-4" />
              <Plus className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 transition duration-300 group-hover:bg-amber-300 group-focus-visible:bg-amber-300" />
            </span>
          </span>
        </span>
      ) : pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : added ? (
        <Check className="h-4 w-4 animate-in zoom-in-95" />
      ) : iconOnly ? (
        <ShoppingBag className="h-4 w-4 shrink-0" />
      ) : null}
      {!iconOnly ? (label ?? (minimumQuantity > 1 ? `Add ${minimumQuantity}+ to cart` : "Add to cart")) : null}
    </button>
  );
}
