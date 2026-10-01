'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductStatusBadge } from '@/components/product-status-badge';
import { StarRating } from '@/components/star-rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiCall } from '@/lib/api/handler';
import { adminApi } from '@/lib/api/services';
import type { AdminProduct, ProductStats } from '@/lib/api/types';
import { PRODUCT_STATUSES } from '@/lib/constants';
import { formatPrice } from '@/lib/format';
import { useT } from '@/lib/i18n';

export default function ProductDashboardPage() {
  const { t, formatDate } = useT();
  const [stats, setStats] = useState<ProductStats>();

  useEffect(() => {
    apiCall(adminApi.productStats(), { toastSuccess: false }).then((r) => setStats(r.data ?? undefined)).catch(() => {});
  }, []);

  if (!stats) return <p className="text-muted-foreground">{t('common.loading')}</p>;
  const maxStatus = Math.max(1, ...Object.values(stats.byStatus));
  const maxCategory = Math.max(1, ...stats.byCategory.map((c) => c.count));
  const kpi = (label: string, value: React.ReactNode) => (
    <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent className="text-3xl font-semibold">{value}</CardContent></Card>
  );
  const row = (p: AdminProduct, extra: React.ReactNode) => (
    <div key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
      <div className="min-w-0"><Link href={`/admin/products/${p.id}/edit`} className="block truncate font-medium hover:underline">{p.name}</Link>
        <div className="text-muted-foreground">{formatPrice(p.price)}</div></div>
      <div className="flex shrink-0 items-center gap-3">{extra}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('admin.products.dashboard.title')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpi(t('admin.products.stats.total'), stats.totalProducts)}
        {kpi(t('admin.products.stats.created7'), stats.createdLast7Days)}
        {kpi(t('admin.products.stats.created30'), stats.createdLast30Days)}
        {kpi(t('admin.products.stats.ratings'), stats.totalRatings)}
        {kpi(t('admin.products.stats.avgRating'), stats.averageRating.toFixed(2))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('admin.products.stats.byStatus')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {PRODUCT_STATUSES.map((s) => (
              <div key={s} className="flex items-center gap-3 text-sm">
                <div className="w-32 shrink-0"><ProductStatusBadge status={s} /></div>
                <div className="h-2 flex-1 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(stats.byStatus[s] / maxStatus) * 100}%` }} /></div>
                <span className="w-8 text-right tabular-nums">{stats.byStatus[s]}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('admin.products.stats.byCategory')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {stats.byCategory.map((c, i) => (
              <div key={`${c.category}-${i}`} className="flex items-center gap-3 text-sm">
                <div className="w-32 shrink-0 truncate">{c.category ?? t('shop.uncategorised')}</div>
                <div className="h-2 flex-1 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(c.count / maxCategory) * 100}%` }} /></div>
                <span className="w-8 text-right tabular-nums">{c.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('admin.products.stats.topRated')}</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {stats.topRated.map((p) => row(p, <><StarRating value={p.ratingAvg} /><span className="text-muted-foreground">({p.ratingCount})</span></>))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('admin.products.stats.recent')}</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {stats.recent.map((p) => row(p, <><ProductStatusBadge status={p.status} /><span className="hidden text-muted-foreground sm:inline">{formatDate(p.createdAt)}</span></>))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
