'use client';
import { useState } from 'react';
import type { User } from '@/lib/api/types';
import { imageUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

export function Avatar({ user, src, className }: { user: Pick<User, 'firstName' | 'lastName' | 'profileImage'>; src?: string | null; className?: string }) {
  const url = src === undefined ? imageUrl(user.profileImage) : src;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  if (url && failedUrl !== url) {
    return <img src={url} alt="" onError={() => setFailedUrl(url)} className={cn('shrink-0 rounded-full object-cover', className)} />;
  }
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground', className)}>
      {initials}
    </span>
  );
}
