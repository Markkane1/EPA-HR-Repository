import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { Office } from '../../domain/entities';

export function useGetOffices() {
  const [data, setData] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService.getOffices()
      .then(res => mounted && setData(res))
      .catch(err => mounted && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}
