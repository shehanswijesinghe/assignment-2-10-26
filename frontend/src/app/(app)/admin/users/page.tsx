'use client';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiCall } from '@/lib/api/handler';
import { adminApi, UserListParams } from '@/lib/api/services';
import type { ApiEnvelope, User } from '@/lib/api/types';
import { STATUS_TRANSITIONS, USER_STATUSES, UserStatus } from '@/lib/constants';
import { useT } from '@/lib/i18n';

type SortKey = 'firstName' | 'lastName' | 'email' | 'createdAt' | 'updatedAt' | 'status';

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id); }, [value, ms]);
  return v;
}

export default function UsersPage() {
  const { t, formatDate } = useT();
  const [rows, setRows] = useState<User[]>([]);
  const [meta, setMeta] = useState<ApiEnvelope['meta']>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [role, setRole] = useState('');
  const [createdFrom, setFrom] = useState('');
  const [createdTo, setTo] = useState('');
  const search = useDebounced(searchInput);

  const load = useCallback(async () => {
    setLoading(true);
    const params: UserListParams = {
      page, pageSize, sortBy, sortOrder,
      ...(status && { status }), ...(search && { search }),
      ...(advanced && role && { role }),
      ...(advanced && createdFrom && { createdFrom }),
      ...(advanced && createdTo && { createdTo: `${createdTo}T23:59:59.999Z` }),
    };
    try {
      const r = await apiCall(adminApi.users(params), { toastSuccess: false });
      setRows(r.data ?? []); setMeta(r.meta);
    } catch {} finally { setLoading(false); }
  }, [page, pageSize, sortBy, sortOrder, status, search, advanced, role, createdFrom, createdTo]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [status, search, pageSize, role, createdFrom, createdTo, advanced]);

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

  async function changeStatus(u: User, next: UserStatus) {
    if (next === 'deleted' && !window.confirm(t('users.confirmDelete'))) return;
    try { await apiCall(adminApi.setStatus(u.id, next)); await load(); } catch {}
  }

  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('users.title')}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Input className="w-56" placeholder={t('users.searchPlaceholder')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Select aria-label={t('users.status')} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('users.allStatuses')}</option>
            {USER_STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
          </Select>
          <Button variant={advanced ? 'default' : 'outline'} onClick={() => setAdvanced(!advanced)}>{t('users.advanced')}</Button>
        </div>
      </div>

      {advanced && (
        <Card className="flex flex-wrap items-end gap-4 p-4">
          <div className="space-y-1"><Label>{t('users.role')}</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">{t('users.allRoles')}</option><option value="USER">USER</option><option value="ADMIN">ADMIN</option>
            </Select></div>
          <div className="space-y-1"><Label>{t('users.createdFrom')}</Label><Input type="date" value={createdFrom} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="space-y-1"><Label>{t('users.createdTo')}</Label><Input type="date" value={createdTo} onChange={(e) => setTo(e.target.value)} /></div>
          <Button variant="ghost" onClick={() => { setRole(''); setFrom(''); setTo(''); setStatus(''); setSearchInput(''); }}>{t('common.reset')}</Button>
        </Card>
      )}

      <Card className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <Table>
          <TableHeader>
            <TableRow>
              {advanced && <TableHead>{t('users.id')}</TableHead>}
              {sortHead('firstName', t('auth.firstName'))}{sortHead('lastName', t('auth.lastName'))}{sortHead('email', t('auth.email'))}
              {advanced && <TableHead>{t('users.role')}</TableHead>}
              {sortHead('createdAt', t('users.createdAt'))}{sortHead('updatedAt', t('users.updatedAt'))}{sortHead('status', t('users.status'))}
              <TableHead>{t('users.changeStatus')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => {
              const options = u.role === 'ADMIN' ? [] : STATUS_TRANSITIONS[u.status];
              return (
                <TableRow key={u.id}>
                  {advanced && <TableCell className="font-mono text-xs">{u.id.slice(0, 8)}</TableCell>}
                  <TableCell>{u.firstName}</TableCell><TableCell>{u.lastName}</TableCell><TableCell>{u.email}</TableCell>
                  {advanced && <TableCell>{u.role}</TableCell>}
                  <TableCell className="whitespace-nowrap">{formatDate(u.createdAt)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(u.updatedAt)}</TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell>
                    {options.length ? (
                      <Select value="" aria-label={t('users.changeStatus')} onChange={(e) => changeStatus(u, e.target.value as UserStatus)}>
                        <option value="">{t('users.changeStatus')}</option>
                        {options.map((s) => <option key={s} value={s}>{t(`action.${s}` as 'action.activated')}</option>)}
                      </Select>
                    ) : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && rows.length === 0 && (
              <TableRow><TableCell colSpan={advanced ? 9 : 7} className="py-8 text-center text-muted-foreground">{t('users.empty')}</TableCell></TableRow>
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
