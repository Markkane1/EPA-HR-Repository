import { useState } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';

export const useUpdatePosition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePosition = async (officeId: string, positionId: string, data: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.updatePosition(officeId, positionId, data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updatePosition, isLoading, error };
};
