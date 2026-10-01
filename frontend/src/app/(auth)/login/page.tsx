'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiCall } from '@/lib/api/handler';
import { authApi } from '@/lib/api/services';
import { ApiError } from '@/lib/api/types';
import { HOME_BY_ROLE } from '@/lib/constants';
import { useT } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const { t } = useT();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiCall(authApi.login({ email, password }));
      setSession(res.data!.accessToken, res.data!.user);
      router.replace(HOME_BY_ROLE[res.data!.user.role]);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'auth.email.not.verified') {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">{t('auth.login.title')}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="email">{t('auth.email')}</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="password">{t('auth.password')}</Label>
            <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? t('common.loading') : t('auth.login.submit')}</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">{t('auth.login.noAccount')} <Link className="underline" href="/register">{t('auth.register.submit')}</Link></p>
      </CardContent>
    </Card>
  );
}
