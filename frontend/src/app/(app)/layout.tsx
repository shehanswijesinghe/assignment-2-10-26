import { AuthGuard } from '@/components/layout/auth-guard';
import { Navbar } from '@/components/layout/navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">{children}</div>
      </div>
    </AuthGuard>
  );
}
