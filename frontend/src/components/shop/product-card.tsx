import Link from 'next/link';
import { StarRating } from '@/components/star-rating';
import { T } from '@/components/shop/t';
import type { ProductCard as ProductCardData } from '@/lib/api/types';
import { formatPrice } from '@/lib/format';
import { imageUrl } from '@/lib/media';

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const src = imageUrl(product.image);
  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <div className="aspect-square overflow-hidden bg-muted">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={product.name} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground"><T k="shop.noImage" /></div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h2 className="line-clamp-2 text-sm font-medium">{product.name}</h2>
        {product.category && <p className="text-xs text-muted-foreground">{product.category.name}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          <span className="flex items-center gap-1 text-xs">
            <StarRating value={product.ratingAvg} className="text-sm" />
            <span className="text-muted-foreground">({product.ratingCount})</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
