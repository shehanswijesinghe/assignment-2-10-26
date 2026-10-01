import * as React from 'react';
import { cn } from '@/lib/utils';

export function Select({ className, ...p }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn('h-9 rounded-md border bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50', className)}
      {...p}
    />
  );
}
