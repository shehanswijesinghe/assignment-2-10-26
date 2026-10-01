import { cn } from '@/lib/utils';

export function StarRating({ value, className }: { value: number; className?: string }) {
  const pct = (Math.max(0, Math.min(5, value)) / 5) * 100;
  return (
    <span role="img" aria-label={`${value.toFixed(1)} / 5`} className={cn('relative inline-block whitespace-nowrap leading-none', className)}>
      <span aria-hidden className="text-muted-foreground/30">★★★★★</span>
      <span aria-hidden className="absolute inset-y-0 left-0 overflow-hidden text-amber-500" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}
