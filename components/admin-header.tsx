"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Package, ReceiptText } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
];

export function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <BrandLogo className="items-center" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">Admin workspace</p>
            <p className="mt-1 text-sm text-slate-300">Products, pickup windows, and order status in one place.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
          <nav className="flex flex-wrap gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/30 hover:text-white",
                  pathname === link.href && "border-amber-300/50 bg-white/10 text-white",
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span>{session?.user?.name ?? session?.user?.email ?? "Admin"}</span>
            <Link href="/" className="rounded-full border border-white/10 px-4 py-2 font-semibold transition hover:bg-white/10 hover:text-white">
              View storefront
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-full bg-amber-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
