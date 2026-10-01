import type { ApiEnvelope } from './types';

const BASE = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

type Params = Record<string, string | number | undefined | null>;

export async function serverGet<T>(path: string, params?: Params, revalidate = 30): Promise<ApiEnvelope<T> | null> {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
  const url = `${BASE}${path}${query.size ? `?${query}` : ''}`;

  const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  return (await res.json()) as ApiEnvelope<T>;
}
