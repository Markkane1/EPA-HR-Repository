import { useState } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { Office } from '../../domain/entities';

export const useUpdateOffice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOffice = async (id: string, officeData: any): Promise<Office | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const office = await apiService.updateOffice(id, officeData);
      return office;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateOffice, isLoading, error };
};
