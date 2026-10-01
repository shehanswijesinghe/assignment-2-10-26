import { ApiError } from '@/lib/api/types';
import { translateCode } from '@/lib/i18n';

export function fieldError(err: unknown, field: string): string | undefined {
  if (!(err instanceof ApiError)) return undefined;
  const d = err.details?.find((x) => x.field === field);
  return d ? translateCode(d.code, d.params) : undefined;
}
