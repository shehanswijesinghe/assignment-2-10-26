'use client';
import { useT } from '@/lib/i18n';
import type { MessageKey } from '@/lib/i18n/en-GB';

export function T({ k, params }: { k: MessageKey; params?: Record<string, string | number> }) {
  const { t } = useT();
  return <>{t(k, params)}</>;
}
