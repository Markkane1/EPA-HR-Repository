import { useState } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';

export function useEndAttachment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (attachmentId: string, effectiveTo?: Date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.endAttachment(attachmentId, effectiveTo);
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
