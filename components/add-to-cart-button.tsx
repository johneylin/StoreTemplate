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
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-950 text-white transition-all duration-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600",
        iconOnly
          ? cn(
              "h-7 w-7 p-0 sm:h-9 sm:w-9",
              quickAdd &&
                "justify-start",
              quickAdd &&
                (added
                  ? "w-[4.6rem] sm:w-[5.4rem]"
                  : "hover:w-[4.1rem] focus-visible:w-[4.1rem] sm:hover:w-[4.8rem] sm:focus-visible:w-[4.8rem]"),
            )
          : "gap-1.5 px-3 py-1.5 text-xs font-semibold sm:gap-2 sm:px-5 sm:py-3 sm:text-sm",
        className,
      )}
    >
      {pending && quickAdd ? (
        <span className="flex h-full w-full items-center justify-center">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
        </span>
      ) : added && quickAdd ? (
        <span className="flex h-full w-full items-center pl-2.5 sm:pl-3">
          <span className="flex w-full items-center gap-1.5 sm:gap-2">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-slate-950 transition-transform duration-300 sm:h-4 sm:w-4">
              <Check className="h-3.5 w-3.5 animate-in zoom-in-95 sm:h-4 sm:w-4" />
            </span>
            <span className="whitespace-nowrap text-[0.65rem] font-semibold text-slate-950 opacity-100 translate-x-0 transition-all duration-300 sm:text-xs">
              Added
            </span>
          </span>
        </span>
      ) : iconOnly && quickAdd ? (
        <span className="flex h-full w-full items-center pl-2.5 sm:pl-3">
          <span className="flex w-full items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                "relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-slate-950 transition-all duration-300 sm:h-4 sm:w-4",
                "group-hover:-translate-x-0.5 group-focus-visible:-translate-x-0.5",
              )}
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <Plus className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white/95 text-slate-950 shadow-sm ring-1 ring-slate-200 transition duration-300 group-hover:bg-amber-300 group-focus-visible:bg-amber-300 sm:-right-1.5 sm:-top-1.5 sm:h-2.5 sm:w-2.5" />
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-[0.65rem] font-semibold text-slate-950 opacity-0 translate-x-2 transition-all duration-300 sm:text-xs",
                "group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0",
              )}
            >
              Add
            </span>
          </span>
        </span>
      ) : pending ? (
        <LoaderCircle className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
      ) : added ? (
        <Check className="h-3.5 w-3.5 animate-in zoom-in-95 sm:h-4 sm:w-4" />
      ) : iconOnly ? (
        <ShoppingBag className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
      ) : null}
      {!iconOnly ? (label ?? (minimumQuantity > 1 ? `Add ${minimumQuantity}+ to cart` : "Add to cart")) : null}
    </button>
  );
}
