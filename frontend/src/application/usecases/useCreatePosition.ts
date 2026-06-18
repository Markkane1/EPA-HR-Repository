import { useState } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';

export const useCreatePosition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPosition = async (officeId: string, positionData: any): Promise<any | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const position = await apiService.createPosition(officeId, positionData);
      return position;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPosition, isLoading, error };
};
