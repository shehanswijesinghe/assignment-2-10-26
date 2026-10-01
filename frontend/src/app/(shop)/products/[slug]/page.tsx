import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gallery } from '@/components/shop/gallery';
import { RateProduct } from '@/components/shop/rate-product';
import { T } from '@/components/shop/t';
import { serverGet } from '@/lib/api/server';
import type { ProductDetail } from '@/lib/api/types';
import { CURRENCY_CODE, formatPrice } from '@/lib/format';
import { imageUrl } from '@/lib/media';
import { SITE_URL } from '@/lib/site';

const load = (slug: string) => serverGet<ProductDetail>(`/products/${slug}`);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = (await load(slug))?.data;
  if (!product) return { title: 'Product not found', robots: { index: false } };

  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.description?.slice(0, 160) || product.name;
  const image = imageUrl(product.image);
  return {
    title,
    description,
    keywords: product.metaKeywords || undefined,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title, description, url: `/products/${product.slug}`, type: 'website', images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await load(slug))?.data;
  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.metaDescription || product.description || undefined,
    sku: product.id,
    image: product.images.map((i) => imageUrl(i)),
    category: product.category?.name,
    url: `${SITE_URL}/products/${product.slug}`,
    offers: { '@type': 'Offer', price: product.price, priceCurrency: CURRENCY_CODE, availability: 'https://schema.org/InStock', url: `${SITE_URL}/products/${product.slug}` },
    ...(product.ratingCount > 0 && { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.ratingAvg, ratingCount: product.ratingCount } }),
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">&larr; <T k="shop.backToShop" /></Link>
      <div className="grid gap-8 md:grid-cols-2">
        <Gallery images={product.images} alt={product.name} />
        <article className="space-y-4">
          {product.category && <p className="text-sm text-muted-foreground">{product.category.name}</p>}
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
          <RateProduct productId={product.id} initialAvg={product.ratingAvg} initialCount={product.ratingCount} />
          {product.description && (
            <section className="space-y-1 border-t pt-4">
              <h2 className="text-sm font-medium"><T k="shop.description" /></h2>
              <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
            </section>
          )}
        </article>
      </div>
    </main>
  );
}
