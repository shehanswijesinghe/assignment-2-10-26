'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { logger } from '@/lib/logger';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useT();
  useEffect(() => {
    logger.error('ui.render_error', { message: error.message, digest: error.digest, stack: error.stack });
  }, [error]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-xl font-semibold">{t('error.title')}</h1>
      <p className="text-muted-foreground">{t('error.body')}</p>
      <Button onClick={reset}>{t('error.retry')}</Button>
    </main>
  );
}
