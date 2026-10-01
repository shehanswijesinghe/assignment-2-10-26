'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

export function Pager({ page, totalPages, query }: { page: number; totalPages: number; query: Record<string, string> }) {
  const { t } = useT();
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams(query);
    if (p > 1) sp.set('page', String(p));
    return sp.size ? `/?${sp}` : '/';
  };
  return (
    <nav className="flex items-center justify-center gap-3 text-sm">
      {page > 1
        ? <Button asChild variant="outline" size="sm"><Link rel="prev" href={href(page - 1)}>{t('common.previous')}</Link></Button>
        : <Button variant="outline" size="sm" disabled>{t('common.previous')}</Button>}
      <span className="text-muted-foreground">{t('shop.pageOf', { page, total: totalPages })}</span>
      {page < totalPages
        ? <Button asChild variant="outline" size="sm"><Link rel="next" href={href(page + 1)}>{t('common.next')}</Link></Button>
        : <Button variant="outline" size="sm" disabled>{t('common.next')}</Button>}
    </nav>
  );
}
