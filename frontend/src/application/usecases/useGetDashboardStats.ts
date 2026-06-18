import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { DashboardStats } from '../../domain/entities';

export function useGetDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService.getDashboardStats()
      .then(res => mounted && setData(res))
      .catch(err => mounted && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}
