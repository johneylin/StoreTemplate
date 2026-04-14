import { AdminHeader } from "@/components/admin-header";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminHeader />
      <main>{children}</main>
    </div>
  );
}
