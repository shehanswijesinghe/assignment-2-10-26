'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiCall } from '@/lib/api/handler';
import { authApi } from '@/lib/api/services';
import { OTP_TTL_SECONDS } from '@/lib/constants';
import { useT } from '@/lib/i18n';

function VerifyForm() {
  const { t } = useT();
  const router = useRouter();
  const [email, setEmail] = useState(useSearchParams().get('email') ?? '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(OTP_TTL_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const time = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await apiCall(authApi.verifyOtp({ email, otp })); router.push('/login'); }
    catch {} finally { setLoading(false); }
  }

  async function resend() {
    try { await apiCall(authApi.resendOtp({ email })); setRemaining(OTP_TTL_SECONDS); setOtp(''); }
    catch {}
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('auth.verify.title')}</CardTitle>
        <CardDescription>{t('auth.verify.description', { email: email || '...' })}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={verify} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="email">{t('auth.email')}</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="otp">{t('auth.verify.code')}</Label>
            <Input id="otp" inputMode="numeric" maxLength={6} pattern="\d{6}" required autoComplete="one-time-code"
              className="text-center text-lg tracking-[0.5em]" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} /></div>
          <p className="text-sm text-muted-foreground">{remaining > 0 ? t('auth.verify.expiresIn', { time }) : t('auth.verify.expired')}</p>
          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>{t('auth.verify.submit')}</Button>
          <Button type="button" variant="outline" className="w-full" onClick={resend}>{t('auth.verify.resend')}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() { return <Suspense><VerifyForm /></Suspense>; }
