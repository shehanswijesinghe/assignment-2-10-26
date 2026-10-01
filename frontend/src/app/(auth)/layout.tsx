'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthHydrated } from '@/hooks/use-hydrated';
import { HOME_BY_ROLE } from '@/lib/constants';
import { useAuthStore } from '@/store/auth';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const ready = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  useEffect(() => { if (ready && user) router.replace(HOME_BY_ROLE[user.role]); }, [ready, user, router]);
  return <main className="flex min-h-screen items-center justify-center bg-muted p-4"><div className="w-full max-w-md">{children}</div></main>;
}
