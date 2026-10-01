import type { Metadata } from 'next';
import { ProductCard } from '@/components/shop/product-card';
import { Pager } from '@/components/shop/pager';
import { ShopFilters, ShopFilterValues } from '@/components/shop/shop-filters';
import { T } from '@/components/shop/t';
import { serverGet } from '@/lib/api/server';
import type { Category, ProductCard as ProductCardData } from '@/lib/api/types';

type SearchParams = Record<string, string | string[] | undefined>;

const SORTS = {
  newest: { sortBy: 'createdAt', sortOrder: 'desc' },
  price_asc: { sortBy: 'price', sortOrder: 'asc' },
  price_desc: { sortBy: 'price', sortOrder: 'desc' },
  rating: { sortBy: 'rating', sortOrder: 'desc' },
  name: { sortBy: 'name', sortOrder: 'asc' },
} as const;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
const nonNegative = (v: string | string[] | undefined) => { const n = Number(one(v)); return one(v) !== '' && Number.isFinite(n) && n >= 0 ? String(n) : ''; };

function parse(sp: SearchParams) {
  const sort = one(sp.sort) in SORTS ? (one(sp.sort) as keyof typeof SORTS) : 'newest';
  const values: ShopFilterValues = {
    q: one(sp.q).trim().slice(0, 100), category: one(sp.category).slice(0, 36), sort,
    minPrice: nonNegative(sp.minPrice), maxPrice: nonNegative(sp.maxPrice),
    minRating: ['2', '3', '4'].includes(one(sp.minRating)) ? one(sp.minRating) : '',
  };
  const page = Math.max(1, Math.min(10_000, parseInt(one(sp.page) || '1', 10) || 1));
  return { values, page };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const filtered = Object.keys(await searchParams).length > 0;
  return {
    title: 'Products',
    description: 'Browse our latest products, compare prices and read ratings.',
    alternates: { canonical: '/' },
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: { title: 'Products', description: 'Browse our latest products, compare prices and read ratings.', url: '/' },
  };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { values, page } = parse(await searchParams);
  const [list, categories] = await Promise.all([
    serverGet<ProductCardData[]>('/products', {
      page, pageSize: 12, ...SORTS[values.sort as keyof typeof SORTS],
      search: values.q, categoryId: values.category, minPrice: values.minPrice, maxPrice: values.maxPrice, minRating: values.minRating,
    }),
    serverGet<Category[]>('/categories', undefined, 60),
  ]);
  const products = list?.data ?? [];
  const totalPages = list?.meta?.totalPages ?? 1;
  const query = Object.fromEntries(Object.entries(values).filter(([k, v]) => v !== '' && !(k === 'sort' && v === 'newest'))) as Record<string, string>;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold"><T k="shop.title" /></h1>
        <p className="text-muted-foreground"><T k="shop.subtitle" /></p>
      </header>
      <ShopFilters categories={categories?.data ?? []} values={values} />
      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground"><T k="shop.empty" /></p>
      ) : (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </section>
      )}
      <Pager page={page} totalPages={totalPages} query={query} />
    </main>
  );
}
