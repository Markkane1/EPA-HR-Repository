import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { OfficeDashboard } from '../../domain/entities';

export function useGetOffice(id: string) {
  const [data, setData] = useState<OfficeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOffice = () => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    apiService.getOffice(id)
      .then(res => mounted && setData(res))
      .catch(err => mounted && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  };

  useEffect(() => {
    const cleanup = fetchOffice();
    return cleanup;
  }, [id]);

  const mutate = () => {
    fetchOffice();
  };

  return { data, loading, error, mutate };
}
