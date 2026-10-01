'use client';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ProductStatusBadge } from '@/components/product-status-badge';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounced } from '@/hooks/use-debounced';
import { apiCall } from '@/lib/api/handler';
import { adminApi, ProductListParams } from '@/lib/api/services';
import type { AdminProduct, ApiEnvelope, Category } from '@/lib/api/types';
import { PRODUCT_STATUSES, PRODUCT_STATUS_TRANSITIONS, ProductStatus } from '@/lib/constants';
import { formatPrice } from '@/lib/format';
import { useT } from '@/lib/i18n';
import { imageUrl } from '@/lib/media';

type SortKey = 'name' | 'price' | 'rating' | 'status' | 'createdAt' | 'updatedAt';

export default function ProductsPage() {
  const { t, formatDate } = useT();
  const [rows, setRows] = useState<AdminProduct[]>([]);
  const [meta, setMeta] = useState<ApiEnvelope['meta']>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [createdFrom, setFrom] = useState('');
  const [createdTo, setTo] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const search = useDebounced(searchInput);

  useEffect(() => {
    if (!advanced || categories.length) return;
    apiCall(adminApi.categories(undefined, 50), { toastSuccess: false }).then((r) => setCategories(r.data ?? [])).catch(() => {});
  }, [advanced, categories.length]);

  const load = useCallback(async () => {
    setLoading(true);
    const params: ProductListParams = {
      page, pageSize, sortBy, sortOrder,
      ...(status && { status }), ...(search && { search }),
      ...(advanced && categoryId && { categoryId }), ...(advanced && minPrice && { minPrice }), ...(advanced && maxPrice && { maxPrice }),
      ...(advanced && minRating && { minRating }), ...(advanced && createdFrom && { createdFrom }),
      ...(advanced && createdTo && { createdTo: `${createdTo}T23:59:59.999Z` }),
    };
    try {
      const r = await apiCall(adminApi.products(params), { toastSuccess: false });
      setRows(r.data ?? []); setMeta(r.meta);
    } catch {} finally { setLoading(false); }
  }, [page, pageSize, sortBy, sortOrder, status, search, advanced, categoryId, minPrice, maxPrice, minRating, createdFrom, createdTo]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [status, search, pageSize, categoryId, minPrice, maxPrice, minRating, createdFrom, createdTo, advanced]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('asc'); }
  };
  const sortHead = (key: SortKey, label: string) => (
    <TableHead>
      <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort(key)}>
        {label}
        {sortBy !== key ? <ArrowUpDown className="size-3" /> : sortOrder === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      </button>
    </TableHead>
  );

  async function changeStatus(p: AdminProduct, next: ProductStatus) {
    if (next === 'deleted' && !window.confirm(t('products.confirmDelete'))) return;
    try { await apiCall(adminApi.setProductStatus(p.id, next)); await load(); } catch {}
  }

  const totalPages = meta?.totalPages ?? 1;
  const cols = advanced ? 11 : 9;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('products.title')}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Input className="w-56" placeholder={t('products.searchPlaceholder')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Select aria-label={t('products.status')} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('products.allStatuses')}</option>
            {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{t(`productStatus.${s}`)}</option>)}
          </Select>
          <Button variant={advanced ? 'default' : 'outline'} onClick={() => setAdvanced(!advanced)}>{t('users.advanced')}</Button>
          <Button asChild><Link href="/admin/products/new">{t('products.add')}</Link></Button>
        </div>
      </div>

      {advanced && (
        <Card className="flex flex-wrap items-end gap-4 p-4">
          <div className="space-y-1"><Label>{t('products.category')}</Label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">{t('shop.allCategories')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select></div>
          <div className="space-y-1"><Label>{t('shop.minPrice')}</Label><Input className="w-28" type="number" min={0} step="0.01" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} /></div>
          <div className="space-y-1"><Label>{t('shop.maxPrice')}</Label><Input className="w-28" type="number" min={0} step="0.01" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} /></div>
          <div className="space-y-1"><Label>{t('shop.minRating')}</Label>
            <Select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
              <option value="">{t('shop.anyRating')}</option>
              {[4, 3, 2, 1].map((n) => <option key={n} value={n}>{t('shop.ratingUp', { n })}</option>)}
            </Select></div>
          <div className="space-y-1"><Label>{t('users.createdFrom')}</Label><Input type="date" value={createdFrom} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="space-y-1"><Label>{t('users.createdTo')}</Label><Input type="date" value={createdTo} onChange={(e) => setTo(e.target.value)} /></div>
          <Button variant="ghost" onClick={() => { setCategoryId(''); setMinPrice(''); setMaxPrice(''); setMinRating(''); setFrom(''); setTo(''); setStatus(''); setSearchInput(''); }}>{t('common.reset')}</Button>
        </Card>
      )}

      <Card className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <Table>
          <TableHeader>
            <TableRow>
              {advanced && <TableHead>{t('products.id')}</TableHead>}
              <TableHead>{t('products.image')}</TableHead>
              {sortHead('name', t('products.name'))}
              <TableHead>{t('products.category')}</TableHead>
              {sortHead('price', t('products.price'))}
              {sortHead('rating', t('products.rating'))}
              {sortHead('status', t('products.status'))}
              {sortHead('createdAt', t('products.createdAt'))}
              {sortHead('updatedAt', t('products.updatedAt'))}
              <TableHead>{t('products.changeStatus')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => {
              const options = PRODUCT_STATUS_TRANSITIONS[p.status];
              const thumb = imageUrl(p.image);
              return (
                <TableRow key={p.id}>
                  {advanced && <TableCell className="font-mono text-xs">{p.id.slice(0, 8)}</TableCell>}
                  <TableCell>{/* eslint-disable-next-line @next/next/no-img-element */}
                    {thumb ? <img src={thumb} alt="" loading="lazy" className="size-10 rounded object-cover" /> : <div className="size-10 rounded bg-muted" />}</TableCell>
                  <TableCell className="max-w-56 truncate font-medium">{p.name}</TableCell>
                  <TableCell>{p.category?.name ?? <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatPrice(p.price)}</TableCell>
                  <TableCell className="whitespace-nowrap"><StarRating value={p.ratingAvg} /> <span className="text-xs text-muted-foreground">({p.ratingCount})</span></TableCell>
                  <TableCell><ProductStatusBadge status={p.status} /></TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(p.createdAt)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(p.updatedAt)}</TableCell>
                  <TableCell>
                    {options.length ? (
                      <Select value="" aria-label={t('products.changeStatus')} onChange={(e) => changeStatus(p, e.target.value as ProductStatus)}>
                        <option value="">{t('products.changeStatus')}</option>
                        {options.map((s) => <option key={s} value={s}>{t(`productAction.${s}`)}</option>)}
                      </Select>
                    ) : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>{p.status !== 'deleted' && <Button asChild variant="outline" size="sm"><Link href={`/admin/products/${p.id}/edit`}>{t('products.edit')}</Link></Button>}</TableCell>
                </TableRow>
              );
            })}
            {!loading && rows.length === 0 && (
              <TableRow><TableCell colSpan={cols} className="py-8 text-center text-muted-foreground">{t('products.empty')}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{t('users.pageOf', { page, total: totalPages, count: meta?.total ?? 0 })}</span>
        <div className="flex items-center gap-2">
          <Label>{t('users.rowsPerPage')}</Label>
          <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('users.prev')}</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>{t('users.next')}</Button>
        </div>
      </div>
    </div>
  );
}
