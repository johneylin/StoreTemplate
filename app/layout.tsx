import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Northstar Commerce",
  description: "Starter ecommerce storefront with Next.js, Prisma, NextAuth, and Stripe.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans text-slate-950 antialiased">
        <Providers>
          <div className="min-h-screen">
            <SiteHeader />
            <main>{children}</main>
            <footer className="border-t border-slate-200/80 bg-white/70">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                <p>Northstar Commerce starter built with Next.js 16, Prisma, NextAuth, and Stripe.</p>
                <p>Use the seeded admin account to manage products and review the data model.</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
