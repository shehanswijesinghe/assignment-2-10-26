import type { ProfileImage } from '@/lib/api/types';

export const imageUrl = (image: ProfileImage | null | undefined): string | null =>
  image ? `${image.baseUrl.replace(/\/+$/, '')}/${image.folder}/${image.name}` : null;

export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';

export const AVATAR_MAX_KB = 2048;
