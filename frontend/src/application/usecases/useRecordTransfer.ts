import { useState } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';

export function useRecordTransfer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (employeeId: string, postingData: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.recordTransfer(employeeId, postingData);
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
