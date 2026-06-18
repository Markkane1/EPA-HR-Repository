import { useState } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';

export const useDeletePosition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePosition = async (officeId: string, positionId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.deletePosition(officeId, positionId);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deletePosition, isLoading, error };
};
