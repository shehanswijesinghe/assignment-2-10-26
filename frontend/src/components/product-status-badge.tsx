'use client';
import { Badge } from '@/components/ui/badge';
import type { ProductStatus } from '@/lib/constants';
import { useT } from '@/lib/i18n';

const variant: Record<ProductStatus, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  active: 'success', draft: 'secondary', deactivated: 'warning', deleted: 'destructive',
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { t } = useT();
  return <Badge variant={variant[status]}>{t(`productStatus.${status}`)}</Badge>;
}
