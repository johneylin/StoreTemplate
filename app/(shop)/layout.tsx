import { SiteHeader } from "@/components/site-header";

export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <main>{children}</main>
      <footer className="border-t border-slate-200/80 bg-white/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Northstar Commerce starter built with Next.js 16, Prisma, NextAuth, and PostgreSQL.</p>
          <p>Customers shop here while admins manage products and orders in a separate dashboard.</p>
        </div>
      </footer>
    </div>
  );
}
