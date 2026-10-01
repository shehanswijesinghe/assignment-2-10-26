'use client';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiCall } from '@/lib/api/handler';
import { adminApi } from '@/lib/api/services';
import type { DashboardStats } from '@/lib/api/types';
import { USER_STATUSES } from '@/lib/constants';
import { useT } from '@/lib/i18n';

export default function DashboardPage() {
  const { t, formatDate } = useT();
  const [stats, setStats] = useState<DashboardStats>();

  useEffect(() => {
    apiCall(adminApi.stats(), { toastSuccess: false }).then((r) => setStats(r.data ?? undefined)).catch(() => {});
  }, []);

  if (!stats) return <p className="text-muted-foreground">{t('common.loading')}</p>;
  const maxDay = Math.max(1, ...stats.registrationsPerDay.map((d) => d.count));
  const maxStatus = Math.max(1, ...Object.values(stats.byStatus));
  const kpi = (label: string, value: number) => (
    <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent className="text-3xl font-semibold">{value}</CardContent></Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('admin.dashboard.title')}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {kpi(t('admin.stats.total'), stats.totalUsers)}
        {kpi(t('admin.stats.last7'), stats.registeredLast7Days)}
        {kpi(t('admin.stats.last30'), stats.registeredLast30Days)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('admin.stats.byStatus')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {USER_STATUSES.map((s) => (
              <div key={s} className="flex items-center gap-3 text-sm">
                <div className="w-44 shrink-0"><StatusBadge status={s} /></div>
                <div className="h-2 flex-1 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(stats.byStatus[s] / maxStatus) * 100}%` }} /></div>
                <span className="w-8 text-right tabular-nums">{stats.byStatus[s]}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('admin.stats.perDay')}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {stats.registrationsPerDay.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs tabular-nums">{d.count}</span>
                  <div className="w-full rounded-t bg-primary" style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: 2 }} />
                  <span className="text-[10px] text-muted-foreground">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>{t('admin.stats.recent')}</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {stats.recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2 text-sm">
              <div><div className="font-medium">{u.firstName} {u.lastName}</div><div className="text-muted-foreground">{u.email}</div></div>
              <div className="flex items-center gap-3"><StatusBadge status={u.status} /><span className="hidden text-muted-foreground sm:inline">{formatDate(u.createdAt)}</span></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
