'use client';
import { Badge } from '@/components/ui/badge';
import type { UserStatus } from '@/lib/constants';
import { useT } from '@/lib/i18n';

const variant: Record<UserStatus, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  email_approval_pending: 'secondary', email_approved: 'secondary', admin_pending: 'warning',
  activated: 'success', deactivated: 'destructive', deleted: 'destructive',
};

export function StatusBadge({ status }: { status: UserStatus }) {
  const { t } = useT();
  return <Badge variant={variant[status]}>{t(`status.${status}`)}</Badge>;
}
