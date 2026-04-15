"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ShoppingBag, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-4 sm:gap-10">
          <Link href="/" className="transition hover:opacity-90">
            <BrandLogo
              className="gap-2 sm:gap-3"
              markClassName="h-9 w-9 sm:h-11 sm:w-11"
              textClassName="[&_span:first-child]:text-lg sm:[&_span:first-child]:text-2xl [&_span:last-child]:hidden sm:[&_span:last-child]:block"
            />
          </Link>
          <nav className="hidden gap-5 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-slate-300 transition hover:text-white",
                  pathname === link.href && "text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:px-4"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-950">
              {count}
            </span>
          </Link>

          {session?.user ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 sm:px-4"
            >
              <UserRound className="h-4 w-4" />
              <span className="truncate">{session.user.name ?? "Sign out"}</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 sm:px-4"
            >
              <UserRound className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
