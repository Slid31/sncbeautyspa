import { requireAuth } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/sidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const [session, { locale }] = await Promise.all([
    requireAuth(),
    params,
  ]);

  const { name, email, role } = session.user;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar name={name!} email={email!} role={role} locale={locale} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
