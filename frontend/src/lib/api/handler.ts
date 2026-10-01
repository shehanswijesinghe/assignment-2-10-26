import { toast } from 'sonner';
import { translateCode } from '@/lib/i18n';
import { INFO_CODES } from '@/lib/i18n/codes';
import { ApiEnvelope, ApiError } from './types';

type Level = 'success' | 'info' | 'error';
const levelOf = (code: string, ok: boolean): Level => (INFO_CODES.has(code) ? 'info' : ok ? 'success' : 'error');

export function notify(code: string, ok: boolean) {
  toast[levelOf(code, ok)](translateCode(code));
}

export async function apiCall<T>(
  request: Promise<{ data: ApiEnvelope<T> }>,
  opts: { toastSuccess?: boolean; toastError?: boolean } = {},
): Promise<ApiEnvelope<T>> {
  const { toastSuccess = true, toastError = true } = opts;
  try {
    const { data } = await request;
    if (toastSuccess) notify(data.code, true);
    return data;
  } catch (err) {
    const e = err instanceof ApiError ? err : new ApiError('internal.error', 0);
    if (toastError) notify(e.code, false);
    throw e;
  }
}
