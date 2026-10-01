import type { MetadataRoute } from 'next';
import { serverGet } from '@/lib/api/server';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await serverGet<{ slug: string; updatedAt: string }[]>('/sitemap/products', undefined, 300).catch(() => null);
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    ...(res?.data ?? []).map((p) => ({ url: `${SITE_URL}/products/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}
