"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export function AddToCartButton({ productId }: { productId: string }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setPending(true);
        addItem(productId);
        router.refresh();
        setTimeout(() => setPending(false), 250);
      }}
      className="inline-flex min-w-32 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      Add to cart
    </button>
  );
}
