import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { EmployeeListItem } from '../../domain/entities';

export function useGetEmployees(filters: any = {}) {
  const [data, setData] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmployees = () => {
    let mounted = true;
    setLoading(true);
    apiService.getEmployees(filters)
      .then(res => mounted && setData(res))
      .catch(err => mounted && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  };

  useEffect(() => {
    const cleanup = fetchEmployees();
    return cleanup;
  }, [JSON.stringify(filters)]);

  const mutate = () => {
    fetchEmployees();
  };

  return { data, loading, error, mutate };
}
