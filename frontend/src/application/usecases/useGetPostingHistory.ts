import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { Posting } from '../../domain/entities';

export function useGetPostingHistory(employeeId: string) {
  const [data, setData] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!employeeId) return;
    let mounted = true;
    setLoading(true);
    apiService.getPostingHistory(employeeId)
      .then(res => mounted && setData(res))
      .catch(err => mounted && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [employeeId]);

  return { data, loading, error };
}
