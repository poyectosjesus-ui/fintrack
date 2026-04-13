// src/hooks/use-api.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';

interface UseApiOptions {
  revalidateOnFocus?: boolean;
}

export function useApi<T>(
  url: string | null,
  options?: UseApiOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = useCallback(async (isSilent = false) => {
    if (!url) return;
    if (!isSilent) setLoading(true);
    
    try {
      const res = await apiFetch<T>(url);
      if (res.error) {
        setError(res.error);
        setData(null);
      } else {
        setData(res.data);
        setError(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred');
      setData(null);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      fetchRequest();
    }
  }, [fetchRequest, url]);

  useEffect(() => {
    if (options?.revalidateOnFocus && url) {
      const onFocus = () => fetchRequest(true);
      window.addEventListener('focus', onFocus);
      return () => window.removeEventListener('focus', onFocus);
    }
  }, [fetchRequest, options?.revalidateOnFocus, url]);

  return { data, loading, error, refetch: fetchRequest, mutate: setData };
}
