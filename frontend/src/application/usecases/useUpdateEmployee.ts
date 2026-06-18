import { useState } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { Employee } from '../../domain/entities';

export const useUpdateEmployee = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEmployee = async (id: string, employeeData: any): Promise<Employee | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const employee = await apiService.updateEmployee(id, employeeData);
      return employee;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateEmployee, isLoading, error };
};
