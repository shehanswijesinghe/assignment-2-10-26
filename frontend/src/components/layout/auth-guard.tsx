'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthHydrated } from '@/hooks/use-hydrated';
import { HOME_BY_ROLE, Role } from '@/lib/constants';
import { useAuthStore } from '@/store/auth';

export function AuthGuard({ role, children }: { role?: Role; children: React.ReactNode }) {
  const router = useRouter();
  const ready = useAuthHydrated();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const allowed = !!token && !!user && (!role || user.role === role);

  useEffect(() => {
    if (!ready) return;
    if (!token || !user) router.replace('/login');
    else if (role && user.role !== role) router.replace(HOME_BY_ROLE[user.role]);
  }, [ready, token, user, role, router]);

  return ready && allowed ? <>{children}</> : null;
}
