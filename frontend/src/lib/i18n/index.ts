import { useCallback } from 'react';
import { useLocaleStore, type Locale } from '@/store/locale';
import { DATE_LOCALE as GB_DATE, enGB, MessageKey, Messages } from './en-GB';
import { DATE_LOCALE as US_DATE, enUS } from './en-US';
import { DATE_LOCALE as SI_DATE, siLK } from './si-LK';

const catalogues: Record<Locale, Messages> = { 'en-GB': enGB, 'en-US': enUS, 'si-LK': siLK };
const dateLocales: Record<Locale, string> = { 'en-GB': GB_DATE, 'en-US': US_DATE, 'si-LK': SI_DATE };

const interpolate = (s: string, params?: Record<string, string | number>) =>
  params ? s.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? '')) : s;

export function translateCode(code: string, params?: Record<string, string | number>): string {
  const cat = catalogues[useLocaleStore.getState().locale];
  return interpolate((cat as Record<string, string>)[`code.${code}`] ?? cat['code.unknown'], params);
}

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) => interpolate(catalogues[locale][key], params),
    [locale],
  );
  const formatDate = useCallback(
    (iso: string) => new Intl.DateTimeFormat(dateLocales[locale], { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)),
    [locale],
  );
  return { t, locale, formatDate };
}
