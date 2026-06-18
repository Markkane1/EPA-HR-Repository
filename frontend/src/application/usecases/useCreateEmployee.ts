import { useState } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';

export function useCreateEmployee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (employeeData: any, postingData: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.createEmployee(employeeData, postingData);
      setLoading(false);
      return data;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      setLoading(false);
      throw e;
    }
  };

  return { execute, loading, error };
}
