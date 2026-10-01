import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AuthGuard } from '@/components/layout/auth-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="ADMIN">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </AuthGuard>
  );
}
