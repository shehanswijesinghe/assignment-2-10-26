import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/profile', '/login', '/register', '/verify-email'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
