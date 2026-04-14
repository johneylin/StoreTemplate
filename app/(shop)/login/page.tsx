import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();

  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 pb-24 lg:grid-cols-[1fr_420px] lg:items-center">
      <section className="rounded-[2.5rem] bg-slate-950 p-10 text-white shadow-2xl shadow-slate-900/20">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">Account access</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-balance">Login for checkout, order history, and admin access.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          Guest checkout is available, and shoppers can also create an account here for order history. Admin credentials are configured privately through environment variables and are not displayed on this page.
        </p>
        <div className="mt-8 rounded-[2rem] bg-white/5 p-6 text-sm leading-7 text-slate-200">
          <p><strong>Shoppers:</strong> you can register a new account from this form.</p>
          <p><strong>Admins:</strong> use the email and password configured for your deployment.</p>
        </div>
      </section>
      <AuthForm />
    </div>
  );
}
