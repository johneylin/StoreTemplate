import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();

  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl justify-center px-4 py-10 pb-20 sm:px-6 sm:py-16 sm:pb-24">
      <AuthForm />
    </div>
  );
}
