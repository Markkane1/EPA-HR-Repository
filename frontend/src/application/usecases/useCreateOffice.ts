import { useState } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { Office } from '../../domain/entities';

export const useCreateOffice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOffice = async (officeData: any): Promise<Office | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const office = await apiService.createOffice(officeData);
      return office;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createOffice, isLoading, error };
};
