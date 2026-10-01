'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { Category } from '@/lib/api/types';
import { useT } from '@/lib/i18n';

export interface ShopFilterValues { q: string; category: string; sort: string; minPrice: string; maxPrice: string; minRating: string }
export const SORT_KEYS = ['newest', 'price_asc', 'price_desc', 'rating', 'name'] as const;

export function ShopFilters({ categories, values }: { categories: Category[]; values: ShopFilterValues }) {
  const { t } = useT();
  return (
    <form key={JSON.stringify(values)} action="/" method="get" role="search" className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6">
      <Input name="q" defaultValue={values.q} maxLength={100} placeholder={t('shop.search')} aria-label={t('shop.search')} className="lg:col-span-2" />
      <Select name="category" defaultValue={values.category} aria-label={t('shop.category')} className="w-full">
        <option value="">{t('shop.allCategories')}</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
      <Select name="sort" defaultValue={values.sort} aria-label={t('shop.sort')} className="w-full">
        {SORT_KEYS.map((k) => <option key={k} value={k}>{t(`shop.sort.${k}`)}</option>)}
      </Select>
      <Select name="minRating" defaultValue={values.minRating} aria-label={t('shop.minRating')} className="w-full">
        <option value="">{t('shop.anyRating')}</option>
        {[4, 3, 2].map((n) => <option key={n} value={n}>{t('shop.ratingUp', { n })}</option>)}
      </Select>
      <div className="flex gap-2 lg:col-span-2">
        <Input name="minPrice" type="number" min={0} step="0.01" defaultValue={values.minPrice} placeholder={t('shop.minPrice')} aria-label={t('shop.minPrice')} />
        <Input name="maxPrice" type="number" min={0} step="0.01" defaultValue={values.maxPrice} placeholder={t('shop.maxPrice')} aria-label={t('shop.maxPrice')} />
      </div>
      <div className="flex gap-2 lg:col-span-2">
        <Button type="submit">{t('shop.apply')}</Button>
        <Button asChild variant="ghost"><Link href="/">{t('shop.reset')}</Link></Button>
      </div>
    </form>
  );
}
