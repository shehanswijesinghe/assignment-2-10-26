'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StarRating } from '@/components/star-rating';
import { useAuthHydrated } from '@/hooks/use-hydrated';
import { apiCall } from '@/lib/api/handler';
import { shopApi } from '@/lib/api/services';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

export function RateProduct({ productId, initialAvg, initialCount }: { productId: string; initialAvg: number; initialCount: number }) {
  const { t } = useT();
  const ready = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [mine, setMine] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    apiCall(shopApi.myRating(productId), { toastSuccess: false, toastError: false })
      .then((r) => setMine(r.data?.myRating ?? null)).catch(() => {});
  }, [ready, user, productId]);

  async function rate(n: number) {
    setBusy(true);
    try {
      const r = await apiCall(shopApi.rate(productId, n));
      if (r.data) { setAvg(r.data.ratingAvg); setCount(r.data.ratingCount); setMine(r.data.myRating); }
    } catch {} finally { setBusy(false); }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StarRating value={avg} className="text-xl" />
        <span className="text-sm font-medium">{avg.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">{count > 0 ? t('shop.ratingsCount', { count }) : t('shop.noRatings')}</span>
      </div>
      {ready && (user ? (
        <div className="space-y-1">
          <p className="text-sm font-medium">{mine ? t('shop.yourRating', { n: mine }) : t('shop.rateThis')}</p>
          <div role="radiogroup" aria-label={t('shop.rateThis')} className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={mine === n} aria-label={t('shop.rateStar', { n })} disabled={busy}
                onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => rate(n)}
                className={cn('text-3xl leading-none transition-colors disabled:opacity-50', n <= (hover || mine || 0) ? 'text-amber-500' : 'text-muted-foreground/30')}>
                ★
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('shop.loginToRate')} <Link className="underline" href="/login">{t('nav.login')}</Link></p>
      ))}
    </div>
  );
}
