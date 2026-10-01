'use client';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error('ui.global_error', { message: error.message, digest: error.digest, stack: error.stack });
  }, [error]);
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', textAlign: 'center', paddingTop: '20vh' }}>
        <h1>Something went wrong</h1>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
