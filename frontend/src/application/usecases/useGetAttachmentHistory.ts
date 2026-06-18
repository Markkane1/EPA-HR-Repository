import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { Attachment } from '../../domain/entities';

export function useGetAttachmentHistory(employeeId: string) {
  const [data, setData] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!employeeId) return;
    let mounted = true;
    setLoading(true);
    apiService.getAttachmentHistory(employeeId)
      .then(res => mounted && setData(res))
      .catch(err => mounted && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [employeeId]);

  return { data, loading, error };
}
