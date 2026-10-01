import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

export function useAuthHydrated() {
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) return;
    if (persist.hasHydrated()) setReady(true);
    return persist.onFinishHydration(() => setReady(true));
  }, []);

  return ready;
}
