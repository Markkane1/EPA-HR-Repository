import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { EmployeeListItem } from '../../domain/entities';

export function useGetEmployees(filters: any = {}) {
  const [data, setData] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService.getEmployees(filters)
      .then(res => mounted && setData(res))
      .catch(err => mounted && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
}
