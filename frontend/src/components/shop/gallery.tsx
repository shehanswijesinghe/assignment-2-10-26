'use client';
import { useState } from 'react';
import type { ProfileImage } from '@/lib/api/types';
import { imageUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import { T } from './t';

export function Gallery({ images, alt }: { images: ProfileImage[]; alt: string }) {
  const urls = images.map((i) => imageUrl(i)!);
  const [active, setActive] = useState(0);
  if (urls.length === 0) {
    return <div className="flex aspect-square items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground"><T k="shop.noImage" /></div>;
  }
  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urls[active]} alt={alt} fetchPriority="high" className="size-full object-contain" />
      </div>
      {urls.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((u, i) => (
            <button key={u} type="button" aria-label={`${alt} ${i + 1}`} aria-current={i === active} onClick={() => setActive(i)}
              className={cn('overflow-hidden rounded-md border-2', i === active ? 'border-primary' : 'border-transparent')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" loading="lazy" className="size-16 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
