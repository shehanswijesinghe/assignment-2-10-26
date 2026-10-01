'use client';
import { ChevronDown, LogOut, UserCog } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select } from '@/components/ui/select';
import { useAuthHydrated } from '@/hooks/use-hydrated';
import { HOME_BY_ROLE } from '@/lib/constants';
import { useT } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth';
import { Locale, LOCALES, useLocaleStore } from '@/store/locale';

export function Navbar() {
  const router = useRouter();
  const { t } = useT();
  const ready = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const { locale, setLocale } = useLocaleStore();
  const signedIn = ready && !!user;

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-4">
        <Link href={signedIn ? HOME_BY_ROLE[user!.role] : '/'} className="font-semibold">{t('app.name')}</Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">{t('nav.shop')}</Link>
      </div>
      <div className="flex items-center gap-3">
        <Select aria-label={t('nav.language')} value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
          {LOCALES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </Select>
        {signedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar user={user!} className="size-8" />
              <span className="hidden text-sm sm:inline">{user!.firstName} {user!.lastName}</span>
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user!.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/profile"><UserCog className="size-4" />{t('nav.updateProfile')}</Link></DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { clear(); router.replace('/'); }}><LogOut className="size-4" />{t('nav.logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link href="/login">{t('nav.login')}</Link></Button>
            <Button asChild size="sm"><Link href="/register">{t('nav.register')}</Link></Button>
          </div>
        )}
      </div>
    </header>
  );
}
