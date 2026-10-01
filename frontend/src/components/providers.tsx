'use client';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { logger } from '@/lib/logger';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
    void useLocaleStore.persist.rehydrate();

    const onError = (e: ErrorEvent) => logger.error('window.error', { message: e.message, source: e.filename, line: e.lineno });
    const onRejection = (e: PromiseRejectionEvent) =>
      logger.error('window.unhandledrejection', { reason: e.reason instanceof Error ? e.reason.message : String(e.reason) });
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  return (<>{children}<Toaster richColors position="top-right" /></>);
}
