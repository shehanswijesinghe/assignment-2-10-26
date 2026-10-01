'use client';
import { Boxes, LayoutDashboard, Package, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const { t } = useT();
  const path = usePathname();
  const isActive = (href: string, dashboard = false) =>
    dashboard ? path === href : path === href || (path.startsWith(`${href}/`) && !path.startsWith(`${href}/dashboard`));
  const item = (href: string, label: string, Icon: typeof Users, dashboard = false) => (
    <Link href={href} className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent', isActive(href, dashboard) && 'bg-accent font-medium')}>
      <Icon className="size-4" />{label}
    </Link>
  );
  const heading = (label: string) => <p className="mt-4 mb-1 px-3 text-xs font-medium uppercase text-muted-foreground first:mt-0">{label}</p>;

  return (
    <aside className="w-56 shrink-0 border-r bg-background p-3">
      {heading(t('nav.userManagement'))}
      {item('/admin/users/dashboard', t('nav.dashboard'), LayoutDashboard, true)}
      {item('/admin/users', t('nav.users'), Users)}
      {heading(t('nav.productManagement'))}
      {item('/admin/products/dashboard', t('nav.dashboard'), Boxes, true)}
      {item('/admin/products', t('nav.products'), Package)}
    </aside>
  );
}
