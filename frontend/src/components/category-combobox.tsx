'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounced } from '@/hooks/use-debounced';
import { apiCall } from '@/lib/api/handler';
import { adminApi } from '@/lib/api/services';
import type { Category } from '@/lib/api/types';
import { useT } from '@/lib/i18n';

export interface CategoryValue { id: string; name: string }

export function CategoryCombobox({ value, onChange, id }: { value: CategoryValue | null; onChange: (v: CategoryValue | null) => void; id?: string }) {
  const { t } = useT();
  const [text, setText] = useState(value?.name ?? '');
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);
  const term = useDebounced(text.trim());

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    apiCall(adminApi.categories(term || undefined), { toastSuccess: false, toastError: false })
      .then((r) => { if (!cancelled) setOptions(r.data ?? []); }).catch(() => {});
    return () => { cancelled = true; };
  }, [open, term]);

  const typed = text.trim();
  const exact = options.find((o) => o.name.toLowerCase() === typed.toLowerCase());

  function choose(c: CategoryValue) {
    setText(c.name); onChange(c); setOpen(false);
  }

  async function add() {
    setBusy(true);
    try {
      const res = await apiCall(adminApi.addCategory(typed));
      if (res.data) choose(res.data);
    } catch {} finally { setBusy(false); }
  }

  return (
    <div className="relative">
      <Input id={id} value={text} autoComplete="off" role="combobox" aria-expanded={open} placeholder={t('wizard.categoryPlaceholder')}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        onChange={(e) => { setText(e.target.value); onChange(null); setOpen(true); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (exact) choose(exact); else if (typed && !busy) void add(); } if (e.key === 'Escape') setOpen(false); }} />
      {open && (
        <ul role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md"
          onMouseDown={(e) => e.preventDefault()}>
          {options.map((o) => (
            <li key={o.id} role="option" aria-selected={value?.id === o.id} onClick={() => choose(o)}
              className="cursor-pointer rounded-sm px-2 py-1.5 hover:bg-accent">{o.name}</li>
          ))}
          {typed && !exact && (
            <li role="option" aria-selected={false} onClick={() => !busy && void add()} className="cursor-pointer rounded-sm px-2 py-1.5 font-medium hover:bg-accent">
              {t('wizard.categoryAdd', { name: typed })}
            </li>
          )}
          {options.length === 0 && !typed && <li className="px-2 py-1.5 text-muted-foreground">{t('wizard.categoryNone')}</li>}
        </ul>
      )}
    </div>
  );
}
