import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { EmployeeProfile } from '../../domain/entities';

export function useGetEmployee(id: string) {
  const [data, setData] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    apiService.getEmployee(id)
      .then(res => mounted && setData(res))
      .catch(err => mounted && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  return { data, loading, error };
}
