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
import { fieldError } from '@/lib/form';
import { useT } from '@/lib/i18n';

export default function RegisterPage() {
  const { t } = useT();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(undefined);
    try {
      await apiCall(authApi.register(form));
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) { setError(err); } finally { setLoading(false); }
  }

  const field = (k: keyof typeof form, label: string, type = 'text', hint?: string) => (
    <div className="space-y-2">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} required value={form[k]} onChange={set(k)} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {fieldError(error, k) && <p className="text-xs text-destructive">{fieldError(error, k)}</p>}
    </div>
  );

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">{t('auth.register.title')}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">{field('firstName', t('auth.firstName'))}{field('lastName', t('auth.lastName'))}</div>
          {field('email', t('auth.email'), 'email')}
          {field('password', t('auth.password'), 'password', t('auth.passwordHint'))}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? t('common.loading') : t('auth.register.submit')}</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">{t('auth.register.haveAccount')} <Link className="underline" href="/login">{t('auth.login.submit')}</Link></p>
      </CardContent>
    </Card>
  );
}
